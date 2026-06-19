const express = require("express");
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const Participant = require("../models/Participant");
const DuplicateAuditLog = require("../models/DuplicateAuditLog");

const router = express.Router();
const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/participants/check-duplicate
router.post(
  "/check-duplicate",
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").trim().isEmail().withMessage("Valid email is required"),
    body("phone").trim().notEmpty().withMessage("Phone is required"),
    body("college").trim().notEmpty().withMessage("College is required"),
    body("skills").optional().isArray(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, college, skills = [] } = req.body;

      const aiResponse = await axios.post(
        `${AI_SERVICE}/api/duplicate-check`,
        { name, email, phone, college, skills },
        { timeout: 5000 }
      );

      const aiResult = aiResponse.data;

      await DuplicateAuditLog.create({
        candidate: { name, email, phone, college },
        duplicate_score: aiResult.duplicate_score,
        status: aiResult.status,
        best_match: aiResult.best_match,
        checked_against: aiResult.checked_against,
        response_time_ms: aiResult.response_time_ms,
        action_taken:
          aiResult.status === "Exact Duplicate"
            ? "auto_rejected"
            : aiResult.status === "Suspicious"
            ? "flagged_for_review"
            : "approved",
      });

      return res.json(aiResult);
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/participants/register
router.post(
  "/register",
  [
    body("name").trim().notEmpty(),
    body("email").trim().isEmail(),
    body("phone").trim().notEmpty(),
    body("college").trim().notEmpty(),
    body("skills").optional().isArray(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, email, phone, college, skills = [] } = req.body;

      const aiResponse = await axios.post(
        `${AI_SERVICE}/api/duplicate-check`,
        { name, email, phone, college, skills },
        { timeout: 5000 }
      );
      const aiResult = aiResponse.data;

      if (aiResult.status === "Exact Duplicate") {
        return res.status(409).json({
          message: "Registration rejected: exact duplicate detected.",
          duplicate_score: aiResult.duplicate_score,
          status: aiResult.status,
        });
      }

      const participant = await Participant.create({
        name,
        email,
        phone,
        college,
        skills,
        registrationStatus: aiResult.status === "Suspicious" ? "pending" : "approved",
        duplicateCheckResult: {
          score: aiResult.duplicate_score,
          status: aiResult.status,
          checkedAt: new Date(),
        },
      });

      await DuplicateAuditLog.create({
        candidate: { name, email, phone, college },
        duplicate_score: aiResult.duplicate_score,
        status: aiResult.status,
        best_match: aiResult.best_match,
        checked_against: aiResult.checked_against,
        response_time_ms: aiResult.response_time_ms,
        action_taken:
          aiResult.status === "Suspicious" ? "flagged_for_review" : "approved",
      });

      return res.status(201).json({
        participant,
        duplicate_check: aiResult,
      });
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/participants
router.get("/", async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = status ? { registrationStatus: status } : {};
    const participants = await Participant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Participant.countDocuments(query);
    res.json({ participants, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
});

// GET /api/participants/audit/duplicates
router.get("/audit/duplicates", async (req, res, next) => {
  try {
    const { status, limit = 50, page = 1 } = req.query;
    const query = status ? { status } : {};
    const entries = await DuplicateAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await DuplicateAuditLog.countDocuments(query);
    res.json({ entries, total });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
