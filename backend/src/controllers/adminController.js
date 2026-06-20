const User = require("../models/User");
const Hackathon = require("../models/Hackathon");
const Registration = require("../models/Registration");
const Team = require("../models/Team");
const Project = require("../models/Project");
const sendEmail = require("../utils/email");

exports.getPendingHackathons = async (req, res) => {
  try {
    const hackathons = await Hackathon.find({ verificationStatus: "pending" })
      .populate("organizerId", "fullName email")
      .sort("createdAt"); // Oldest first FIFO

    res.status(200).json({ success: true, data: hackathons });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.verifyHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId", "email fullName");
    if (!hackathon || hackathon.verificationStatus !== "pending") {
      return res.status(404).json({ message: "Hackathon not found or not pending verification" });
    }

    hackathon.verificationStatus = "verified";
    hackathon.status = "upcoming";
    hackathon.verifiedAt = new Date();
    hackathon.verifiedBy = req.user._id;
    hackathon.rejectionReason = null; // Clear if it was previously rejected
    await hackathon.save();

    await sendEmail({
      email: hackathon.organizerId.email,
      subject: "Your Hackathon has been Verified!",
      template: "hackathon-verified",
      data: { title: hackathon.title, organizerName: hackathon.organizerId.fullName },
    });

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectHackathon = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || rejectionReason.length < 20) {
      return res.status(400).json({ message: "Rejection reason is required and must be at least 20 characters." });
    }

    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId", "email fullName");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    hackathon.verificationStatus = "rejected";
    hackathon.status = "draft";
    hackathon.rejectedAt = new Date();
    hackathon.rejectedBy = req.user._id;
    hackathon.rejectionReason = rejectionReason;
    await hackathon.save();

    await sendEmail({
      email: hackathon.organizerId.email,
      subject: "Action Required: Hackathon Needs Changes",
      template: "hackathon-rejected",
      data: { 
        title: hackathon.title, 
        organizerName: hackathon.organizerId.fullName,
        rejectionReason 
      },
    });

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllHackathons = async (req, res) => {
  try {
    const { status, verificationStatus, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;

    const hackathons = await Hackathon.find(query)
      .populate("organizerId", "fullName")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hackathon.countDocuments(query);
    res.status(200).json({ success: true, data: hackathons, pagination: { total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHackathonFullDetails = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const registrations = await Registration.find({ hackathonId: hackathon._id }).populate("userId");
    const teams = await Team.find({ hackathonId: hackathon._id });
    const projects = await Project.find({ hackathonId: hackathon._id });

    res.status(200).json({
      success: true,
      data: {
        hackathon,
        registrations,
        teams,
        projects,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAnalyticsOverview = async (req, res) => {
  try {
    const [totalUsers, activeHackathons, pendingVerifications] = await Promise.all([
      User.countDocuments(),
      Hackathon.countDocuments({ status: { $in: ["registration_open", "ongoing", "evaluating"] } }),
      Hackathon.countDocuments({ verificationStatus: "pending" }),
    ]);

    res.status(200).json({
      success: true,
      data: { totalUsers, activeHackathons, pendingVerifications },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { role, page = 1, limit = 20 } = req.query;
    const query = {};
    if (role) query.role = role;

    const users = await User.find(query)
      .select("-passwordHash -passwordHistory -sessions")
      .sort("-createdAt")
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(query);
    res.status(200).json({ success: true, data: users, pagination: { total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { fullName, email, role } = req.body;
    
    // Check if user exists
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Email uniqueness check if email is being updated
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    if (role) {
      user.role = role;
    }

    await user.save();

    res.status(200).json({ success: true, data: user, message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Using mongoose-delete plugin's delete method for soft delete
    await user.delete();

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acknowledgeHackathonEdit = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    hackathon.hasUnreviewedEdits = false;
    hackathon.editReason = null;
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectHackathonEdit = async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    if (!rejectionReason || rejectionReason.length < 10) {
      return res.status(400).json({ message: "A reason is required to reject these edits (min 10 chars)." });
    }

    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId", "email fullName");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // Mark as rejected, unpublish
    hackathon.verificationStatus = "rejected";
    hackathon.status = "draft";
    hackathon.rejectedAt = new Date();
    hackathon.rejectedBy = req.user._id;
    hackathon.rejectionReason = rejectionReason;
    
    // Clear the unreviewed edits flag since we've rejected the hackathon entirely
    hackathon.hasUnreviewedEdits = false;
    hackathon.editReason = null;
    
    await hackathon.save();

    await sendEmail({
      email: hackathon.organizerId.email,
      subject: "Action Required: Hackathon Edits Rejected",
      template: "hackathon-rejected",
      data: { 
        title: hackathon.title, 
        organizerName: hackathon.organizerId.fullName,
        rejectionReason 
      },
    });

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
