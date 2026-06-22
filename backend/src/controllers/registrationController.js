const Registration = require("../models/Registration");
const Hackathon = require("../models/Hackathon");
const Team = require("../models/Team");
const mongoose = require("mongoose");
const { uploadFile } = require("../services/gridfsService");
const { checkDuplicate, extractTextFromResume } = require("../services/aiService");
const { generateRegistrationExcel } = require("../services/excelService");
const sendEmail = require("../utils/email");

exports.registerForHackathon = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    if (hackathon.status !== "registration_open" || hackathon.timeline.registrationEnd < new Date()) {
      return res.status(400).json({ message: "Registration is not open for this hackathon" });
    }

    const existingReg = await Registration.findOne({ hackathonId: hackathon._id, userId: req.user._id });
    if (existingReg) {
      if (existingReg.status === "cancelled") {
        await existingReg.delete(); // Delete cancelled one to start fresh
      } else {
        return res.status(409).json({ message: "You are already registered for this hackathon" });
      }
    }

    let status = "confirmed";
    let isWaitlisted = false;
    
    // Check capacity
    const regCount = await Registration.countDocuments({ hackathonId: hackathon._id, status: { $in: ["confirmed", "pending_review"] } });
    if (hackathon.config.maxParticipants && regCount >= hackathon.config.maxParticipants) {
      status = "waitlisted";
      isWaitlisted = true;
    }

    let resumeData = {};
    let resumeText = "";

    // Handle resume upload
    if (req.file) {
      if (req.file.size > 5 * 1024 * 1024) return res.status(400).json({ message: "Resume exceeds 5MB limit" });
      
      const fileExt = req.file.originalname.split('.').pop().toLowerCase();
      if (!["pdf", "doc", "docx"].includes(fileExt)) {
        return res.status(400).json({ message: "Invalid file type. Only PDF and DOCX allowed." });
      }

      resumeText = await extractTextFromResume(req.file.buffer, req.file.mimetype);
      const uploaded = await uploadFile(req.file.buffer, req.file.originalname, req.file.mimetype, hackathon.title);
      
      resumeData = {
        driveFileId: uploaded.fileId,
        fileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        viewUrl: uploaded.webViewLink,
        downloadUrl: uploaded.webContentLink,
      };
    }

    // Prepare User Data for AI
    const userData = {
      email: req.user.email,
      fullName: req.user.fullName,
      phone: req.user.phone || req.body.phone,
      institution: req.body.institution,
      skills: req.body.skills,
      experienceLevel: req.body.experienceLevel,
      resumeText,
    };

    let duplicateCheckResult = null;
    let message = "Registration successful";

    if (!isWaitlisted) {
      try {
        // Fetch existing confirmed to check against
        const existingParticipants = await Registration.find({ hackathonId: hackathon._id, status: "confirmed" })
          .populate("userId", "email fullName")
          .select("userId skills experienceLevel");

        const aiResult = await checkDuplicate(userData, existingParticipants);
        
        if (aiResult) {
          const confidence = (aiResult.duplicate_score || 0) / 100;
          const isDuplicate = aiResult.status === "Exact Duplicate" || aiResult.status === "Suspicious";
          const matchedUserId = aiResult.best_match && mongoose.Types.ObjectId.isValid(aiResult.best_match.existing_id)
            ? new mongoose.Types.ObjectId(aiResult.best_match.existing_id)
            : undefined;
          const matchedUserName = aiResult.best_match ? aiResult.best_match.existing_name : undefined;
          
          let reasons = [];
          if (aiResult.best_match && aiResult.best_match.matching_fields) {
            reasons = aiResult.best_match.matching_fields.map(field => {
              const score = aiResult.best_match.field_scores?.[field];
              return score ? `Matched ${field} with ${score.toFixed(0)}% similarity` : `Matched ${field}`;
            });
          }

          duplicateCheckResult = {
            isDuplicate,
            confidence,
            matchedUserId,
            matchedUserName,
            reasons,
            checkedAt: new Date(),
          };

          if (confidence >= 0.90) {
            status = "rejected";
            message = "Registration rejected due to high duplicate probability.";
          } else if (confidence >= 0.70) {
            status = "pending_review";
            message = "Registration pending manual review.";
          }
        }
      } catch (err) {
        console.warn("AI Duplicate check failed, falling back to pending_review", err.message);
        status = "pending_review";
        message = "Registration pending manual review due to AI service unavailability.";
      }
    } else {
      message = "Hackathon is at capacity. You have been added to the waitlist.";
    }

    const registration = await Registration.create({
      hackathonId: hackathon._id,
      userId: req.user._id,
      status,
      experienceLevel: req.body.experienceLevel,
      skills: req.body.skills ? req.body.skills.split(",") : [],
      institution: req.body.institution,
      country: req.body.country,
      gender: req.body.gender,
      resumeText,
      resumeFile: resumeData.driveFileId ? resumeData : undefined,
      duplicateCheckResult,
      waitlistedAt: isWaitlisted ? new Date() : undefined,
    });

    res.status(201).json({ success: true, status, message, registration });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOne({ hackathonId: req.params.id, userId: req.user._id })
      .populate("hackathonId", "title timeline config")
      .populate({
        path: "teamId",
        populate: { path: "members", select: "fullName email" }
      });
    
    if (!reg) return res.status(404).json({ message: "Registration not found" });
    res.status(200).json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findOne({ hackathonId: req.params.id, userId: req.user._id });
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    const hackathon = await Hackathon.findById(req.params.id);
    if (["ongoing", "evaluating", "completed"].includes(hackathon.status)) {
      return res.status(400).json({ message: "Cannot cancel registration after event has started" });
    }

    reg.status = "cancelled";
    reg.cancelledAt = new Date();
    reg.cancelledBy = req.user._id;

    if (reg.teamId) {
      const team = await Team.findById(reg.teamId);
      if (team) {
        team.members = team.members.filter(m => m.toString() !== req.user._id.toString());
        if (team.members.length === 0) await team.delete();
        else await team.save();
      }
      reg.teamId = undefined;
    }

    await reg.save();

    // Auto-promote waitlist
    const nextInLine = await Registration.findOne({ hackathonId: hackathon._id, status: "waitlisted" }).sort("waitlistedAt");
    if (nextInLine) {
      nextInLine.status = "confirmed";
      nextInLine.waitlistPosition = undefined;
      await nextInLine.save();
      // Optionally notify
    }

    res.status(200).json({ success: true, message: "Registration cancelled successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRegistrations = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;
    const query = { hackathonId: req.params.id };
    
    if (status) query.status = status;
    
    // Simplistic search, for complex need aggregation with lookup
    const regs = await Registration.find(query)
      .populate("userId", "fullName email")
      .populate("teamId", "name")
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort("-createdAt");

    const total = await Registration.countDocuments(query);
    res.status(200).json({ success: true, data: { registrations: regs }, pagination: { total, page: Number(page) } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportRegistrations = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { hackathonId: req.params.id };
    if (status) query.status = status;

    const registrations = await Registration.find(query)
      .populate("userId", "fullName email")
      .populate("teamId", "name");

    const hackathon = await Hackathon.findById(req.params.id);
    
    const buffer = generateRegistrationExcel(registrations, hackathon.title);
    
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="fairjudge-${hackathon.title.replace(/\s+/g, '-')}-registrations.xlsx"`);
    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRegistrationStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    const reg = await Registration.findById(req.params.registrationId);
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    if (status === "rejected" && (!reason || reason.length < 10)) {
      return res.status(400).json({ message: "Rejection requires a reason of at least 10 characters." });
    }

    if (status === "confirmed" && ["pending_review", "waitlisted"].includes(reg.status)) {
      const hackathon = await Hackathon.findById(reg.hackathonId);
      const regCount = await Registration.countDocuments({ hackathonId: hackathon._id, status: "confirmed" });
      if (hackathon.config.maxParticipants && regCount >= hackathon.config.maxParticipants) {
        return res.status(400).json({ message: "Hackathon is at capacity" });
      }
    }

    reg.status = status;
    reg.reviewedBy = req.user._id;
    reg.reviewedAt = new Date();
    if (reason) reg.reviewReason = reason;

    await reg.save();
    res.status(200).json({ success: true, data: reg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRegistrationStats = async (req, res) => {
  try {
    const hackathonId = new mongoose.Types.ObjectId(req.params.id);

    const stats = await Registration.aggregate([
      { $match: { hackathonId } },
      { $facet: {
          "statusCounts": [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          "experience": [{ $group: { _id: "$experienceLevel", count: { $sum: 1 } } }],
          "gender": [{ $group: { _id: "$gender", count: { $sum: 1 } } }],
          "country": [{ $group: { _id: "$country", count: { $sum: 1 } } }]
      }}
    ]);

    res.status(200).json({ success: true, data: stats[0] });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.acknowledgeProblemUpdate = async (req, res) => {
  try {
    const reg = await Registration.findOne({ hackathonId: req.params.id, userId: req.user._id });
    if (!reg) return res.status(404).json({ message: "Registration not found" });

    reg.lastSeenProblemUpdate = new Date();
    await reg.save();

    res.status(200).json({ success: true, message: "Update acknowledged" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAllRegistrations = async (req, res) => {
  try {
    const regs = await Registration.find({ userId: req.user._id }).populate("hackathonId");
    res.status(200).json({ success: true, data: regs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const { downloadFileStream } = require("../services/gridfsService");

exports.downloadResumeFile = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.registrationId);
    if (!reg || !reg.resumeFile || !reg.resumeFile.driveFileId) {
      return res.status(404).json({ message: "Resume not found" });
    }
    
    // Check if the user is authorized (handled by middleware, but ensure it exists)
    res.setHeader("Content-Disposition", `inline; filename="${reg.resumeFile.fileName}"`);
    res.setHeader("Content-Type", reg.resumeFile.mimeType || "application/pdf");

    const isLocal = reg.resumeFile.viewUrl && reg.resumeFile.viewUrl.startsWith("/uploads");
    const { stream } = await downloadFileStream(reg.resumeFile.driveFileId, isLocal);
    stream.pipe(res);
  } catch (err) {
    console.error("Resume proxy error:", err);
    res.status(500).json({ message: "Failed to load resume" });
  }
};

exports.sendEmailToParticipants = async (req, res) => {
  try {
    const { registrationIds, subject, message } = req.body;
    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return res.status(400).json({ message: "At least one registration ID is required" });
    }
    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const registrations = await Registration.find({ 
      _id: { $in: registrationIds },
      hackathonId: req.params.id 
    }).populate("userId", "email fullName");

    const emails = registrations.map(reg => reg.userId.email).filter(e => e);

    if (emails.length === 0) {
      return res.status(400).json({ message: "No valid email addresses found for selected participants" });
    }

    // Send emails
    for (const email of emails) {
      await sendEmail({
        email,
        subject,
        message,
        // Since we don't have a specific template for custom messages right now, 
        // we just use raw text, or if there's a generic template, we could use it.
        // Let's rely on standard text/html if we want, but message is text.
      });
    }

    res.status(200).json({ success: true, message: `Successfully sent email to ${emails.length} participants.` });
  } catch (err) {
    console.error("Send Email Error:", err);
    res.status(500).json({ message: "Failed to send emails" });
  }
};
