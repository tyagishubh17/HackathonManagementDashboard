const Evaluation = require("../models/Evaluation");
const Hackathon = require("../models/Hackathon");
const Project = require("../models/Project");
const User = require("../models/User");
const BiasAuditLog = require("../models/BiasAuditLog");
const { assignReviewers, detectBias, getReviewSuggestions } = require("../services/aiService");

// ========================
// ORGANIZER ENDPOINTS
// ========================

exports.assignReviewersAI = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // In a real app, judges might be mapped in a HackathonJudge collection or User role mapping
    // Here we'll grab all users with role 'judge' 
    const judges = await User.find({ role: "judge" }).select("_id fullName judgeDetails email");
    
    // Grab all submitted projects
    const projects = await Project.find({ hackathonId: hackathon._id, status: "submitted" })
      .populate("teamId", "skillDistribution")
      .select("_id title description techStack teamId");

    if (projects.length === 0 || judges.length === 0) {
      return res.status(400).json({ message: "Need both submitted projects and available judges to run assignment." });
    }

    // Call AI
    const aiResult = await assignReviewers(judges, projects, { reviewsPerProject: 3 });
    // Expects { assignments: [{ projectId, reviewerIds: [id1, id2] }] }

    // Create Draft Evaluations
    const createdEvaluations = [];
    for (const assignment of aiResult.assignments) {
      for (const revId of assignment.reviewerIds) {
        // Upsert draft to avoid duplicates
        const evalDoc = await Evaluation.findOneAndUpdate(
          { projectId: assignment.projectId, reviewerId: revId, hackathonId: hackathon._id },
          { status: "draft", totalScore: 0 },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        createdEvaluations.push(evalDoc);
      }
    }

    res.status(200).json({ success: true, message: "Assignments generated successfully", count: createdEvaluations.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ hackathonId: req.params.id })
      .populate("reviewerId", "fullName email")
      .populate("projectId", "title techStack status");
    res.status(200).json({ success: true, data: evaluations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reassignReviewer = async (req, res) => {
  try {
    const { evaluationId, newReviewerId } = req.body;
    const evaluation = await Evaluation.findById(evaluationId);
    if (!evaluation) return res.status(404).json({ message: "Evaluation not found" });

    // Delete old, create new to preserve unique index natively, or just update if no collision
    const existing = await Evaluation.findOne({ projectId: evaluation.projectId, reviewerId: newReviewerId });
    if (existing) return res.status(400).json({ message: "Judge is already assigned to this project" });

    evaluation.reviewerId = newReviewerId;
    evaluation.status = "draft";
    evaluation.scores = {};
    evaluation.totalScore = 0;
    evaluation.feedback = "";
    await evaluation.save();

    res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================
// JUDGE ENDPOINTS
// ========================

exports.getMyAssignments = async (req, res) => {
  try {
    const evals = await Evaluation.find({ reviewerId: req.user._id })
      .populate({ path: "projectId", populate: { path: "hackathonId", select: "title" } })
      .sort("-createdAt");
    res.status(200).json({ success: true, data: evals });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate("projectId");
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    if (evaluation.reviewerId.toString() !== req.user._id.toString() && req.user.role !== "organizer" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.scoreEvaluation = async (req, res) => {
  try {
    const { scores, feedback } = req.body;
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    if (evaluation.reviewerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    if (evaluation.status !== "draft") return res.status(400).json({ message: "Evaluation already finalized" });

    const hackathon = await Hackathon.findById(evaluation.hackathonId);

    // Validate scores against rubric
    let totalScore = 0;
    for (const item of hackathon.rubric) {
      const val = scores[item.criteria] || 0;
      if (val > item.maxScore || val < 0) return res.status(400).json({ message: `Invalid score for ${item.criteria}` });
      totalScore += val;
    }

    // Call AI Bias Detect
    const biasResult = await detectBias(feedback, scores, hackathon.rubric);
    
    evaluation.scores = scores;
    evaluation.totalScore = totalScore;
    evaluation.feedback = feedback;
    evaluation.biasFlags = biasResult.flags || [];

    if (biasResult.biasDetected) {
      await BiasAuditLog.create({
        evaluationId: evaluation._id,
        reviewerId: req.user._id,
        projectId: evaluation.projectId,
        hackathonId: evaluation.hackathonId,
        detectedBiases: biasResult.flags,
        reviewerFeedback: feedback,
        scoresSnapshot: scores,
        aiConfidence: biasResult.confidence,
        actionTaken: biasResult.confidence > 0.8 ? "warning_issued" : "flagged_only"
      });
    }

    await evaluation.save();
    res.status(200).json({ success: true, data: evaluation, biasDetected: biasResult.biasDetected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    if (evaluation.reviewerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    // Finalize
    evaluation.status = "submitted";
    await evaluation.save();

    res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAISuggestions = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id).populate("projectId");
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    if (evaluation.reviewerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    const hackathon = await Hackathon.findById(evaluation.hackathonId);

    const suggestions = await getReviewSuggestions(evaluation.projectId, hackathon.rubric);
    if (suggestions) {
      evaluation.aiSuggestedScores = suggestions.suggestedScores;
      await evaluation.save();
      return res.status(200).json({ success: true, data: suggestions });
    }
    
    res.status(503).json({ message: "AI suggestion engine unavailable" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ========================
// RESULTS & APPEALS
// ========================

exports.getResults = async (req, res) => {
  try {
    // Basic aggregation: average score per project
    const results = await Evaluation.aggregate([
      { $match: { hackathonId: req.params.id, status: "submitted" } },
      { $group: {
          _id: "$projectId",
          averageScore: { $avg: "$totalScore" },
          evaluationsCount: { $sum: 1 }
      }},
      { $sort: { averageScore: -1 } }
    ]);

    // Populate project details manually since aggregate loses mongoose schemas
    const populated = await Project.populate(results, { path: "_id", select: "title teamId" });

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.appealEvaluation = async (req, res) => {
  try {
    const { appealReason } = req.body;
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    
    // Security check omitted for brevity, but should check if req.user is part of the project's team
    
    evaluation.status = "appealed";
    evaluation.appealReason = appealReason;
    await evaluation.save();

    res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.reviewAppeal = async (req, res) => {
  try {
    const { appealResponse, statusChange } = req.body;
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });

    evaluation.status = statusChange || "resolved";
    evaluation.appealResponse = appealResponse;
    await evaluation.save();

    res.status(200).json({ success: true, data: evaluation });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
