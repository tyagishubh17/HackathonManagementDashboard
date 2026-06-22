const Hackathon = require("../models/Hackathon");
const Registration = require("../models/Registration");
const Team = require("../models/Team");
const Project = require("../models/Project");
const User = require("../models/User");
const sendEmail = require("../utils/email");
const { uploadFile, deleteFile, downloadFileStream } = require("../services/gridfsService");

const validateTimeline = (timeline) => {
  const { registrationStart, registrationEnd, hackathonStart, hackathonEnd, submissionDeadline } = timeline;
  const rs = new Date(registrationStart);
  const re = new Date(registrationEnd);
  const hs = new Date(hackathonStart);
  const he = new Date(hackathonEnd);
  const sd = new Date(submissionDeadline);

  if (rs >= re) return "Registration start must be before registration end";
  if (re >= hs) return "Registration end must be before hackathon start";
  if (hs >= he) return "Hackathon start must be before hackathon end";
  if (he >= sd) return "Hackathon end must be before submission deadline";
  return null;
};

exports.createHackathon = async (req, res) => {
  try {
    const { title, description, timeline, rubric, config, problemStatements } = req.body;

    if (timeline) {
      const error = validateTimeline(timeline);
      if (error) return res.status(400).json({ message: error });
    }

    const hackathon = await Hackathon.create({
      title,
      description,
      timeline,
      rubric,
      config,
      problemStatements,
      organizerId: req.user._id,
      status: "draft",
      verificationStatus: "pending", // Will move to pending_verification on publish
    });

    res.status(201).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getMyHackathons = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, sort = "-createdAt" } = req.query;
    const query = { organizerId: req.user._id };
    if (status) query.status = status;

    const hackathons = await Hackathon.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hackathon.countDocuments(query);

    // Dynamically fetch accurate counts
    const populated = await Promise.all(
      hackathons.map(async (h) => {
        const hObj = h.toObject();
        hObj.dynamicStats = {
          registrationCount: await Registration.countDocuments({ hackathonId: h._id }),
          teamCount: await Team.countDocuments({ hackathonId: h._id }),
          submissionCount: await Project.countDocuments({ hackathonId: h._id }),
        };
        return hObj;
      })
    );

    res.status(200).json({
      success: true,
      data: populated,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId", "fullName email");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const isOrganizer = req.user && req.user.role === "organizer" && hackathon.organizerId._id.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "super_admin";

    if (isOrganizer || isAdmin) {
      const hObj = hackathon.toObject();
      hObj.dynamicStats = {
        registrationCount: await Registration.countDocuments({ hackathonId: hackathon._id }),
        teamCount: await Team.countDocuments({ hackathonId: hackathon._id }),
        submissionCount: await Project.countDocuments({ hackathonId: hackathon._id }),
      };
      return res.status(200).json({ success: true, data: hObj });
    }

    // Public view fallback
    res.status(200).json({ success: true, data: hackathon.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const isOrganizer = req.user.role === "organizer" && hackathon.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "super_admin";

    if (!isOrganizer && !isAdmin) return res.status(403).json({ message: "Not authorized" });

    if (["completed", "cancelled"].includes(hackathon.status)) {
      return res.status(400).json({ message: "Cannot update a completed or cancelled hackathon" });
    }

    // We allow ongoing/evaluating updates if it's just minor things, but let's keep the existing logic:
    if (hackathon.verificationStatus === "verified" && ["ongoing", "evaluating"].includes(hackathon.status)) {
      return res.status(400).json({ message: "Cannot update settings while event is ongoing" });
    }

    // Auto-flag for admin review when a verified hackathon is updated by organizer
    if (isOrganizer && hackathon.verificationStatus === "verified") {
      hackathon.hasUnreviewedEdits = true;
    }

    if (req.body.timeline) {
      const error = validateTimeline(req.body.timeline);
      if (error) return res.status(400).json({ message: error });
    }

    // Don't accidentally overwrite verification flags if passed by malicious payload
    delete req.body.verificationStatus;
    delete req.body.hasUnreviewedEdits;
    delete req.body.editReason;

    Object.assign(hackathon, req.body);
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const isOrganizer = req.user.role === "organizer" && hackathon.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "super_admin";
    if (!isOrganizer && !isAdmin) return res.status(403).json({ message: "Not authorized" });

    hackathon.status = "cancelled";
    hackathon.cancelledAt = new Date();
    hackathon.cancelledBy = req.user._id;
    await hackathon.save();

    // Send email to all participants
    const registrations = await Registration.find({ hackathonId: hackathon._id }).populate("userId", "email");
    const emails = registrations.map(r => r.userId.email).filter(e => e);

    if (emails.length > 0) {
      // Send batched or individually in prod, doing Bcc style or looping
      for (const email of emails) {
        await sendEmail({
          email,
          subject: "Hackathon Cancelled",
          template: "hackathon-cancelled",
          data: { title: hackathon.title },
        });
      }
    }

    res.status(200).json({ success: true, message: "Hackathon successfully cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getVerificationStatus = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).select("verificationStatus rejectionReason verifiedAt rejectedAt");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.publishHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    if (!hackathon.title || !hackathon.description || !hackathon.timeline.registrationStart || hackathon.rubric.length === 0) {
      return res.status(400).json({ message: "All required fields must be filled out before publishing" });
    }
    if (hackathon.problemStatements.length === 0) {
      return res.status(400).json({ message: "At least one problem statement is required" });
    }

    hackathon.verificationStatus = "pending"; // Represents 'pending_verification' workflow
    hackathon.publishedAt = new Date();
    hackathon.organizerFeedback = req.body.organizerFeedback || null;
    await hackathon.save();

    // Email Super Admin (find any super admin)
    const admin = await User.findOne({ role: "super_admin" });
    if (admin) {
      await sendEmail({
        email: admin.email,
        subject: "New Hackathon Pending Verification",
        template: "hackathon-published",
        data: { title: hackathon.title, organizerName: req.user.fullName },
      });
    }

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.postAnnouncement = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    if (!req.body.text || req.body.text.trim() === "") {
      return res.status(400).json({ message: "Announcement text is required" });
    }

    hackathon.announcements.unshift({ text: req.body.text, postedAt: new Date() });
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const announcement = hackathon.announcements.id(req.params.announcementId);
    if (!announcement) return res.status(404).json({ message: "Announcement not found" });

    hackathon.announcements.pull(req.params.announcementId);
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addProblemStatement = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const newStatement = { ...req.body };

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      if (!["pdf", "doc", "docx", "xls", "xlsx"].includes(fileExt)) {
        return res.status(400).json({ message: "Invalid file type. Only PDF, Word, and Excel allowed." });
      }

      const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      newStatement.referenceFile = {
        fileId: uploaded.fileId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        viewUrl: uploaded.webViewLink,
        downloadUrl: uploaded.webContentLink,
        isLocal: uploaded.isLocal
      };
    }

    if (newStatement.scheduledAt && new Date(newStatement.scheduledAt) > new Date()) {
      // It's scheduled for the future
    } else {
      // If no schedule provided, or it's in the past, post it now
      newStatement.scheduledAt = new Date();
    }

    hackathon.problemStatements.push(newStatement);
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateProblemStatement = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Not authorized" });

    const problem = hackathon.problemStatements.id(req.params.problemId);
    if (!problem) return res.status(404).json({ message: "Problem statement not found" });

    if (req.body.maxTeams) {
      const assignedTeams = await Team.countDocuments({ hackathonId: hackathon._id, problemStatementId: problem._id });
      if (assignedTeams > req.body.maxTeams) {
        return res.status(400).json({ message: `Cannot set maxTeams lower than currently assigned teams (${assignedTeams})` });
      }
    }

    const updates = { ...req.body };

    if (req.file) {
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      if (!["pdf", "doc", "docx", "xls", "xlsx"].includes(fileExt)) {
        return res.status(400).json({ message: "Invalid file type. Only PDF, Word, and Excel allowed." });
      }

      const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype);
      updates.referenceFile = {
        fileId: uploaded.fileId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        viewUrl: uploaded.webViewLink,
        downloadUrl: uploaded.webContentLink,
        isLocal: uploaded.isLocal
      };

      // Attempt to delete old file if it exists
      if (problem.referenceFile && problem.referenceFile.fileId) {
        deleteFile(problem.referenceFile.fileId, problem.referenceFile.isLocal).catch(console.error);
      }
    }

    // Check if it's currently live and being updated
    if (problem.scheduledAt && new Date(problem.scheduledAt) <= new Date()) {
      // It was live. Any update triggers an updatedAt for the participant popup
      updates.updatedAt = new Date();
    }

    // If they change the schedule to "Now"
    if (updates.scheduledAt && new Date(updates.scheduledAt) <= new Date()) {
      updates.scheduledAt = new Date();
    }

    Object.assign(problem, updates);
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteProblemStatement = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const problem = hackathon.problemStatements.id(req.params.problemId);
    if (!problem) return res.status(404).json({ message: "Problem statement not found" });

    const assignedTeams = await Team.countDocuments({ hackathonId: hackathon._id, problemStatementId: problem._id });
    if (assignedTeams > 0) {
      return res.status(400).json({ message: "Cannot delete problem statement with assigned teams" });
    }

    hackathon.problemStatements.pull(req.params.problemId);
    await hackathon.save();

    res.status(200).json({ success: true, data: hackathon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUBLIC
exports.getPublicHackathons = async (req, res) => {
  try {
    const { search, category, status, page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const query = {
      verificationStatus: "verified",
      status: { $in: ["upcoming", "registration_open", "ongoing"] },
    };

    if (status) query.status = status;
    if (search) query.$text = { $search: search };
    if (category) query["problemStatements.category"] = category;

    const hackathons = await Hackathon.find(query)
      .populate("organizerId", "fullName")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Hackathon.countDocuments(query);

    const publicData = hackathons.map(h => h.toPublicJSON());

    res.status(200).json({
      success: true,
      data: publicData,
      pagination: { total, page: Number(page), limit: Number(limit) },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getPublicHackathonById = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({
      _id: req.params.id,
      verificationStatus: "verified",
      status: { $in: ["upcoming", "registration_open", "ongoing", "evaluating", "completed"] },
    }).populate("organizerId", "fullName");

    if (!hackathon) return res.status(404).json({ message: "Hackathon not found or not public" });

    res.status(200).json({ success: true, data: hackathon.toPublicJSON() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadProblemStatementFile = async (req, res) => {
  try {
    const hackathon = await Hackathon.findOne({
      _id: req.params.id,
      verificationStatus: "verified",
    });

    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    const problem = hackathon.problemStatements.id(req.params.problemId);
    if (!problem || !problem.referenceFile || !problem.referenceFile.fileId) {
      return res.status(404).json({ message: "File not found" });
    }

    if (problem.scheduledAt && new Date(problem.scheduledAt) > new Date()) {
      return res.status(403).json({ message: "This file is not yet available for download" });
    }

    res.setHeader("Content-Disposition", `attachment; filename="${problem.referenceFile.fileName}"`);
    res.setHeader("Content-Type", problem.referenceFile.mimeType || "application/octet-stream");

    const { stream } = await downloadFileStream(problem.referenceFile.fileId, problem.referenceFile.isLocal);
    stream.pipe(res);
  } catch (err) {
    console.error("Download Error:", err);
    res.status(500).json({ message: "Failed to download file" });
  }
};
