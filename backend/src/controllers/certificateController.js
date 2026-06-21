const mongoose = require("mongoose");
const Certificate = require("../models/Certificate");
const Hackathon = require("../models/Hackathon");
const Registration = require("../models/Registration");
const Project = require("../models/Project");
const Evaluation = require("../models/Evaluation");
const sendEmail = require("../utils/email");
const { generateCertificatePDF } = require("../services/certificateService");

// Helper: determine certificate type for each participant based on ranked results
async function buildParticipantTypeMap(hackathonId) {
  const typeMap = new Map(); // userId.toString() -> "winner"|"runner_up"|"participation"
  const oid = new mongoose.Types.ObjectId(hackathonId);

  const results = await Evaluation.aggregate([
    { $match: { hackathonId: oid, status: "submitted" } },
    { $group: { _id: "$projectId", averageScore: { $avg: "$totalScore" } } },
    { $sort: { averageScore: -1 } },
  ]);

  if (results.length === 0) return typeMap;

  const topProjectIds = results.slice(0, 2).map((r, i) => ({ id: r._id.toString(), rank: i }));

  for (const { id: projectId, rank } of topProjectIds) {
    const project = await Project.findById(projectId).select("teamId");
    if (!project || !project.teamId) continue;

    const registrations = await Registration.find({
      hackathonId,
      teamId: project.teamId,
      status: "confirmed",
    }).select("userId");

    const certType = rank === 0 ? "winner" : "runner_up";
    registrations.forEach((r) => typeMap.set(r.userId.toString(), certType));
  }

  return typeMap;
}

// POST /api/hackathons/:id/publish-results  (Organizer only)
exports.publishResults = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id).populate("organizerId", "fullName");
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    if (hackathon.organizerId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!["evaluating", "completed"].includes(hackathon.status)) {
      return res.status(400).json({ message: "Results can only be published when hackathon is in evaluating or completed status" });
    }

    const organizerName = hackathon.organizerId.fullName;
    const issuedAt = new Date();

    // Mark hackathon
    hackathon.resultsPublished = true;
    hackathon.resultsPublishedAt = issuedAt;
    hackathon.certificatesGeneratedAt = issuedAt;
    if (hackathon.status === "evaluating") hackathon.status = "completed";
    await hackathon.save();

    // Build winner/runner_up map
    const typeMap = await buildParticipantTypeMap(hackathon._id);

    // Get all confirmed registrations
    const registrations = await Registration.find({
      hackathonId: hackathon._id,
      status: "confirmed",
    }).populate("userId", "fullName email");

    const createdCerts = [];

    for (const reg of registrations) {
      if (!reg.userId) continue;

      const userId = reg.userId._id;
      const certType = typeMap.get(userId.toString()) || "participation";
      const certData = {
        participantName: reg.userId.fullName,
        hackathonName: hackathon.title,
        organizerName,
        issuedAt: issuedAt.toISOString(),
        type: certType,
      };

      const cert = await Certificate.findOneAndUpdate(
        { hackathonId: hackathon._id, userId },
        {
          type: certType,
          certificateData: certData,
          pdfUrl: "generated",
          issuedAt,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      createdCerts.push(cert);

      // Email notification (best-effort, don't fail the request)
      sendEmail({
        email: reg.userId.email,
        subject: `Your Certificate is Ready — ${hackathon.title}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;">
            <h2 style="color:#1a237e;">Your Certificate is Ready!</h2>
            <p>Hi <strong>${reg.userId.fullName}</strong>,</p>
            <p>The results for <strong>${hackathon.title}</strong> have been published and your certificate is now available for download.</p>
            <p>Log in to the FairJudge platform and visit the <strong>Certificates</strong> section to download your certificate.</p>
            <br/>
            <p style="color:#888;font-size:12px;">— The FairJudge Team</p>
          </div>
        `,
      }).catch(() => {});
    }

    res.status(200).json({
      success: true,
      message: `Results published. ${createdCerts.length} certificate(s) generated.`,
      data: { certificatesCount: createdCerts.length },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/hackathons/:id/certificates  (Organizer only)
exports.getHackathonCertificates = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });
    if (hackathon.organizerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const certs = await Certificate.find({ hackathonId: hackathon._id })
      .populate("userId", "fullName email")
      .sort("-issuedAt");

    res.status(200).json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/certificates/mine  (Participant)
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ userId: req.user._id })
      .populate("hackathonId", "title organizerId")
      .sort("-issuedAt");

    res.status(200).json({ success: true, data: certs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/certificates/:certId/download
exports.downloadCertificate = async (req, res) => {
  try {
    const cert = await Certificate.findById(req.params.certId)
      .populate("hackathonId", "title organizerId")
      .populate("userId", "fullName");

    if (!cert) return res.status(404).json({ message: "Certificate not found" });

    // Allow: cert owner, hackathon organizer, or super_admin
    const isOwner = req.user && cert.userId._id.toString() === req.user._id.toString();
    const isOrganizer = req.user && cert.hackathonId.organizerId.toString() === req.user._id.toString();
    const isAdmin = req.user && req.user.role === "super_admin";

    if (!isOwner && !isOrganizer && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to download this certificate" });
    }

    const data = cert.certificateData instanceof Map
      ? Object.fromEntries(cert.certificateData)
      : cert.certificateData || {};

    const pdfBuffer = await generateCertificatePDF({
      participantName: data.participantName || cert.userId.fullName,
      hackathonName: data.hackathonName || cert.hackathonId.title,
      organizerName: data.organizerName || "Event Organizer",
      issuedAt: data.issuedAt || cert.issuedAt,
      certificateId: cert._id.toString().slice(-8).toUpperCase(),
      type: cert.type,
    });

    const safeName = (data.hackathonName || "certificate").replace(/[^a-z0-9]/gi, "_").toLowerCase();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="certificate_${safeName}_${cert._id.toString().slice(-6)}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.end(pdfBuffer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
