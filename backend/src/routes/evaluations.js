const express = require("express");
const { authenticate, requireOrganizer } = require("../middleware/auth");
const {
  assignReviewersAI,
  getAssignments,
  reassignReviewer,
  getMyAssignments,
  getEvaluation,
  scoreEvaluation,
  submitEvaluation,
  getAISuggestions,
  getResults,
  appealEvaluation,
  reviewAppeal,
} = require("../controllers/evaluationController");

const router = express.Router({ mergeParams: true });

// Apply authentication verification globally across all child endpoints
router.use(authenticate);

// --- JUDGE / PARTICIPANT ENTRANCES ---
router.get("/my-assignments", getMyAssignments);
router.get("/:id", getEvaluation);
router.post("/:id/score", scoreEvaluation);
router.put("/:id/submit", submitEvaluation);
router.post("/:id/ai-suggest", getAISuggestions);
router.post("/:id/appeal", appealEvaluation); 

// --- ORGANIZER RESTRICTED ENTRIES ---
router.put("/:id/appeal-review", requireOrganizer, reviewAppeal); 
router.post("/assign", requireOrganizer, assignReviewersAI);
router.get("/assignments", requireOrganizer, getAssignments);
router.post("/reassign", requireOrganizer, reassignReviewer);

// Split panel visibility shield results
router.get("/results", getResults);

module.exports = router;
