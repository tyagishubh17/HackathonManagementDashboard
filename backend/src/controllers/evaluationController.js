require("dotenv").config();
const mongoose = require("mongoose");
const Evaluation = require("../models/Evaluation");
const Hackathon = require("../models/Hackathon");
const Project = require("../models/Project");
const User = require("../models/User");
const BiasAuditLog = require("../models/BiasAuditLog");
const Registration = require("../models/Registration"); 
const { detectBias, getReviewSuggestions } = require("../services/aiService");
const axios = require("axios");

// Helper function to maintain statistical mathematical accuracy
function roundToTwo(num) {
  return +(Math.round(num + "e+2") + "e-2");
}

// =========================================================================
// ⚙️ ORGANIZER ENDPOINTS & STRUCTURAL MATRIX CALCULATIONS
// =========================================================================

/**
 * Feature 1: Automated 3-3 Reviewer Panel Assignment Matrix
 * Splits exactly 6 judges into 2 balanced panels and distributes projects evenly between them.
 * Returns the populated panels directly to the organizer frontend upon execution.
 */
exports.assignReviewersAI = async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id);
    if (!hackathon) return res.status(404).json({ message: "Hackathon not found" });

    // 1. Fetch all available users with role 'judge'
    const judges = await User.find({ role: "judge" }).select("_id fullName judgeDetails email");
    
    // 2. Grab all submitted projects
    const projects = await Project.find({ hackathonId: hackathon._id, status: "submitted" })
      .populate("teamId", "skillDistribution")
      .select("_id title description techStack teamId");

    if (projects.length === 0 || judges.length === 0) {
      return res.status(400).json({ message: "Need both submitted projects and available judges to run assignment." });
    }

    // ENFORCE CONSTRAINT: Requires exactly 6 reviewers for automated 3-3 partition
    if (judges.length !== 6) {
      return res.status(400).json({ 
        message: `Automated 3-3 panel configuration requires exactly 6 judges. Found: ${judges.length}` 
      });
    }

    // 3. Form two distinct 3-member panels (Panel A and Panel B) via runtime randomization
    const shuffledJudges = [...judges].sort(() => 0.5 - Math.random());
    const panelA = shuffledJudges.slice(0, 3);
    const panelB = shuffledJudges.slice(3, 6);

    const panelAIds = panelA.map(j => j._id);
    const panelBIds = panelB.map(j => j._id);

    // Randomize project sequence to prevent sequential placement entry bias
    const shuffledProjects = [...projects].sort(() => 0.5 - Math.random());
    const midpoint = Math.ceil(shuffledProjects.length / 2);
    
    const projectsForA = shuffledProjects.slice(0, midpoint);
    const projectsForB = shuffledProjects.slice(midpoint);

    const createdEvaluations = [];

    // Helper utility to bulk upsert panel structures across documents
    const provisionPanel = async (projectList, panelLabel, judgeIds) => {
      for (const project of projectList) {
        // Track the assignment panel context inside the registration document matrix mapping
        await Registration.findOneAndUpdate(
          { hackathonId: hackathon._id, teamId: project.teamId },
          { assignedPanel: panelLabel, reviewers: judgeIds },
          { upsert: true }
        );

        // Create individual blank evaluation entries for the 3 panel judges
        for (const judgeId of judgeIds) {
          const evalDoc = await Evaluation.findOneAndUpdate(
            { projectId: project._id, reviewerId: judgeId, hackathonId: hackathon._id },
            { status: "draft", totalScore: 0 },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );
          createdEvaluations.push(evalDoc);
        }
      }
    };

    // 4. Dispatch matrix task allocation loops
    await provisionPanel(projectsForA, "A", panelAIds);
    await provisionPanel(projectsForB, "B", panelBIds);

    // Send data back down to the frontend—including the computed panel lists for the organizer's UI
    res.status(200).json({ 
      success: true, 
      message: `Successfully formed two distinct 3-member panels (Panel A & Panel B) and distributed work arrays evenly.`, 
      count: createdEvaluations.length,
      panels: {
        A: panelA.map(j => j.fullName),
        B: panelB.map(j => j.fullName)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAssignments = async (req, res) => {
  try {
    const evaluations = await Evaluation.find({ hackathonId: req.params.id })
      .populate("reviewerId", "fullName email role")
      .populate({
        path: "projectId",
        select: "title techStack status teamId",
        populate: { path: "teamId", select: "name" }
      });
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

// =========================================================================
// 🛡️ JUDGE ENDPOINTS & PEER PANEL DATA HYDRATION
// =========================================================================

/**
 * Hydrates assignments list payload alongside live peer panel configurations
 */
exports.getMyAssignments = async (req, res) => {
  try {
    const evals = await Evaluation.find({ reviewerId: req.user._id })
      .populate({
        path: "projectId",
        select: "title description techStack submissionFiles status teamId",
        populate: { path: "hackathonId", select: "title rubric timeline" }
      })
      .populate("hackathonId", "title rubric")
      .sort("-createdAt");
    
    // Inject peer parameters directly dynamically based on team registrations
    const completedAssignments = await Promise.all(evals.map(async (evaluation) => {
      const doc = evaluation.toObject();
      if (doc.projectId && doc.projectId.teamId) {
        const registrationContext = await Registration.findOne({
          hackathonId: doc.hackathonId._id,
          teamId: doc.projectId.teamId
        }).populate("reviewers", "fullName email");
        
        if (registrationContext) {
          if (doc.projectId.hackathonId) {
            doc.projectId.hackathonId.assignedPanel = registrationContext.assignedPanel;
            doc.projectId.hackathonId.reviewers = registrationContext.reviewers;
          }
          doc.assignedPanel = registrationContext.assignedPanel;
          doc.reviewers = registrationContext.reviewers;
        }
      }
      return doc;
    }));
    
    res.status(200).json({ success: true, data: completedAssignments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Hydrates single assignment views with full peer context metrics
 */
exports.getEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id)
      .populate({
        path: "projectId",
        select: "title description techStack submissionFiles teamId",
        populate: { path: "hackathonId", select: "title rubric timeline" }
      })
      .populate("hackathonId", "title rubric timeline");
    
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    
    if (evaluation.reviewerId.toString() !== req.user._id.toString() && req.user.role !== "organizer" && req.user.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const doc = evaluation.toObject();
    if (doc.projectId && doc.projectId.teamId) {
      const registrationContext = await Registration.findOne({
        hackathonId: doc.hackathonId._id,
        teamId: doc.projectId.teamId
      }).populate("reviewers", "fullName email");

      if (registrationContext) {
        if (doc.projectId.hackathonId) {
          doc.projectId.hackathonId.assignedPanel = registrationContext.assignedPanel;
          doc.projectId.hackathonId.reviewers = registrationContext.reviewers;
        }
        if (doc.hackathonId) {
          doc.hackathonId.assignedPanel = registrationContext.assignedPanel;
          doc.hackathonId.reviewers = registrationContext.reviewers;
        }
        doc.assignedPanel = registrationContext.assignedPanel;
        doc.reviewers = registrationContext.reviewers;
      }
    }

    res.status(200).json({ success: true, data: doc });
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

    let totalScore = 0;
    for (const item of hackathon.rubric) {
      const val = scores[item.criteria] || 0;
      if (val > item.maxScore || val < 0) return res.status(400).json({ message: `Invalid score for ${item.criteria}` });
      totalScore += val;
    }

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

/**
 * Feature 2 Integration: Finalizes score sheets and executes AI telemetry drift checks
 */
exports.submitEvaluation = async (req, res) => {
  try {
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    if (evaluation.reviewerId.toString() !== req.user._id.toString()) return res.status(403).json({ message: "Unauthorized" });

    evaluation.status = "submitted";
    await evaluation.save();

    // --- FEATURE 2 VARIANCE TELEMETRY RUN ---
    try {
      const project = await Project.findById(evaluation.projectId);
      const allSubmittedEvals = await Evaluation.find({ projectId: project._id, status: "submitted" });
      const scoresArray = allSubmittedEvals.map(e => e.totalScore);
      
      let verificationText = project.description || "";
      if (project.techStack) verificationText += " " + project.techStack.join(" ");

      const aiServiceUrl = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
      const varianceResponse = await axios.post(`${aiServiceUrl}/api/review-agent/variance-check`, {
        pdf_text: verificationText,
        human_scores: scoresArray,
        threshold: 2.0 
      });

      const { variance, trigger_alert, ai_score, human_average } = varianceResponse.data;

      if (trigger_alert) {
        await BiasAuditLog.create({
          evaluationId: evaluation._id,
          reviewerId: req.user._id,
          projectId: project._id,
          hackathonId: evaluation.hackathonId,
          detectedBiases: ["AI_HUMAN_VARIANCE_DISCREPANCY"],
          reviewerFeedback: `System alert: Discrepancy detected. AI baseline is ${ai_score} while human panel computed average is ${human_average}. Drift: ${variance}`,
          scoresSnapshot: evaluation.scores,
          aiConfidence: parseFloat((variance / 10).toFixed(2)),
          actionTaken: "flagged_only",
          resolved: false
        });
        console.log(`[ALERT] High variance score anomaly captured for Project: ${project._id}`);
      }
    } catch (aiErr) {
      console.error("AI variance microservice pipeline execution bypassed:", aiErr.message);
    }
    // --- END FEATURE 2 INTELLIGENCE CHECK ---

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

// =========================================================================
// 👁️ RESULTS & APPEALS WITH SECURE VISIBILITY SHIELD MAPPINGS
// =========================================================================

exports.getResults = async (req, res) => {
  try {
    const hackathonId = req.params.id;
    const user = req.user; 

    // ROLE LEVEL 1: ORGANIZERS & SUPER ADMINS (Full Access View)
    if (user.role === "organizer" || user.role === "super_admin") {
      const results = await Evaluation.aggregate([
        { $match: { hackathonId: new mongoose.Types.ObjectId(hackathonId), status: "submitted" } },
        { $group: {
            _id: "$projectId",
            averageScore: { $avg: "$totalScore" },
            evaluationsCount: { $sum: 1 },
            rawBreakdowns: { $push: { reviewerId: "$reviewerId", score: "$totalScore", feedback: "$feedback" } }
        }},
        { $sort: { averageScore: -1 } }
      ]);

      const populated = await Project.populate(results, { path: "_id", select: "title teamId" });
      return res.status(200).json({ success: true, accessLevel: "organizer", data: populated });
    }

    // ROLE LEVEL 2: PARTICIPANTS (Single Team Blind Aggregate Shield)
    if (user.role === "participant") {
      const project = await Project.findOne({ hackathonId, teamId: user.teamId });
      if (!project) {
        return res.status(404).json({ message: "No project submission records found for your team registration." });
      }

      const evaluations = await Evaluation.find({ projectId: project._id, status: "submitted" });
      if (evaluations.length === 0) {
        return res.status(200).json({ success: true, accessLevel: "participant", finalScore: null, message: "Scores have not been finalized or published." });
      }

      const total = evaluations.reduce((acc, curr) => acc + curr.totalScore, 0);
      const finalScore = total / evaluations.length;

      return res.status(200).json({ 
        success: true, 
        accessLevel: "participant", 
        data: {
          projectTitle: project.title,
          finalScore: roundToTwo(finalScore),
          reviewCount: evaluations.length
        } 
      });
    }

    // ROLE LEVEL 3: REVIEWERS (Peer Panel Isolation Matrix Window)
    if (user.role === "judge" || user.role === "reviewer") {
      const assignedRegistrations = await Registration.find({ hackathonId, reviewers: user._id });
      const assignedTeamIds = assignedRegistrations.map(r => r.teamId);

      const assignedProjects = await Project.find({ hackathonId, teamId: { $in: assignedTeamIds } }).select("_id");
      const assignedProjectIds = assignedProjects.map(p => p._id);

      // Extract logs submitted ONLY by panel peers (blinded completely from outer panels)
      const visibleEvaluations = await Evaluation.find({
        hackathonId,
        projectId: { $in: assignedProjectIds },
        status: "submitted"
      }).populate("projectId", "title teamId");

      const panelGroupedResults = {};
      visibleEvaluations.forEach(evalDoc => {
        const pid = evalDoc.projectId._id.toString();
        if (!panelGroupedResults[pid]) {
          panelGroupedResults[pid] = {
            projectTitle: evalDoc.projectId.title,
            scores: []
          };
        }
        panelGroupedResults[pid].scores.push({
          score: evalDoc.totalScore,
          feedback: evalDoc.feedback
        });
      });

      return res.status(200).json({ 
        success: true, 
        accessLevel: "reviewer_panel", 
        data: Object.values(panelGroupedResults) 
      });
    }

    return res.status(403).json({ message: "Access Denied: Unrecognized execution credentials." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.appealEvaluation = async (req, res) => {
  try {
    const { appealReason } = req.body;
    const evaluation = await Evaluation.findById(req.params.id);
    if (!evaluation) return res.status(404).json({ message: "Not found" });
    
    const project = await Project.findById(evaluation.projectId);
    if (!project || project.teamId.toString() !== req.user.teamId.toString()) {
      return res.status(403).json({ message: "Unauthorized to appeal this score card evaluation execution profile." });
    }
    
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
