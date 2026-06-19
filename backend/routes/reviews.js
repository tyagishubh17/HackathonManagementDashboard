const express = require("express");
const axios = require("axios");
const { body, validationResult } = require("express-validator");
const Review = require("../models/Review");
const BiasAuditLog = require("../models/BiasAuditLog");

const router = express.Router();
const AI_SERVICE = process.env.AI_SERVICE_URL || "http://localhost:8000";

// POST /api/reviews/submit
router.post(
  "/submit",
  [
    body("reviewer_id").trim().notEmpty(),
    body("project_id").trim().notEmpty(),
    body("innovation").isFloat({ min: 0, max: 100 }),
    body("technical").isFloat({ min: 0, max: 100 }),
    body("presentation").isFloat({ min: 0, max: 100 }),
    body("final_score").isFloat({ min: 0, max: 100 }),
    body("tech_stack").optional().isArray(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { reviewer_id, project_id, innovation, technical, presentation, final_score, tech_stack = [] } = req.body;

      const aiResponse = await axios.post(
        `${AI_SERVICE}/api/bias-detect`,
        { reviewer_id, project_id, innovation, technical, presentation, final_score, tech_stack },
        { timeout: 5000 }
      );
      const biasResult = aiResponse.data;

      const review = await Review.create({
        reviewer_id,
        project_id,
        innovation,
        technical,
        presentation,
        final_score,
        tech_stack,
        normalized_score: biasResult.analytics?.normalized_score,
        biasCheckResult: {
          bias_detected: biasResult.bias_detected,
          bias_type: biasResult.bias_type,
          confidence: biasResult.confidence,
          recommended_action: biasResult.recommended_action,
          checkedAt: new Date(),
        },
      });

      await BiasAuditLog.create({
        reviewer_id,
        project_id,
        evaluation: { innovation, technical, presentation, final_score, tech_stack },
        bias_detected: biasResult.bias_detected,
        bias_type: biasResult.bias_type,
        bias_flags: biasResult.bias_flags,
        confidence: biasResult.confidence,
        recommended_action: biasResult.recommended_action,
        analytics: biasResult.analytics,
        escalated: biasResult.confidence > 0.8,
      });

      return res.status(201).json({
        review,
        bias_analysis: biasResult,
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/reviews/check-bias (analysis only, no persist)
router.post(
  "/check-bias",
  [
    body("reviewer_id").trim().notEmpty(),
    body("project_id").trim().notEmpty(),
    body("innovation").isFloat({ min: 0, max: 100 }),
    body("technical").isFloat({ min: 0, max: 100 }),
    body("presentation").isFloat({ min: 0, max: 100 }),
    body("final_score").isFloat({ min: 0, max: 100 }),
    body("tech_stack").optional().isArray(),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const aiResponse = await axios.post(
        `${AI_SERVICE}/api/bias-detect`,
        req.body,
        { timeout: 5000 }
      );
      return res.json(aiResponse.data);
    } catch (err) {
      next(err);
    }
  }
);

// GET /api/reviews/audit/bias
router.get("/audit/bias", async (req, res, next) => {
  try {
    const { reviewer_id, bias_detected, page = 1, limit = 50 } = req.query;
    const query = {};
    if (reviewer_id) query.reviewer_id = reviewer_id;
    if (bias_detected !== undefined) query.bias_detected = bias_detected === "true";

    const entries = await BiasAuditLog.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await BiasAuditLog.countDocuments(query);
    res.json({ entries, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/reviews/analytics/reviewer/:id
router.get("/analytics/reviewer/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const logs = await BiasAuditLog.find({ reviewer_id: id }).sort({ createdAt: -1 });
    if (!logs.length) {
      return res.json({ reviewer_id: id, total_reviews: 0 });
    }

    const biasCount = logs.filter((l) => l.bias_detected).length;
    const flagBreakdown = {};
    logs.forEach((l) => {
      (l.bias_flags || []).forEach((f) => {
        flagBreakdown[f] = (flagBreakdown[f] || 0) + 1;
      });
    });

    res.json({
      reviewer_id: id,
      total_reviews: logs.length,
      bias_detected_count: biasCount,
      bias_rate: ((biasCount / logs.length) * 100).toFixed(1),
      flag_breakdown: flagBreakdown,
      recent: logs.slice(0, 10),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/reviews/audit/bias/:id/resolve
router.patch("/audit/bias/:id/resolve", async (req, res, next) => {
  try {
    const { resolution_notes } = req.body;
    const log = await BiasAuditLog.findByIdAndUpdate(
      req.params.id,
      { resolved: true, resolution_notes },
      { new: true }
    );
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json(log);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
