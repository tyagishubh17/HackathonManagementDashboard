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

router.use(authenticate);

// --- JUDGE / PARTICIPANT ---
router.get("/my-assignments", getMyAssignments);
router.get("/:id", getEvaluation);
router.post("/:id/score", scoreEvaluation);
router.put("/:id/submit", submitEvaluation);
router.post("/:id/ai-suggest", getAISuggestions);

router.post("/:id/appeal", appealEvaluation); // Participant
router.put("/:id/appeal-review", requireOrganizer, reviewAppeal); // Organizer

// --- ORGANIZER (Mounted on /api/hackathons/:id/reviewers & /results) ---
// Note: We'll route these differently in hackathons.js, but exposing endpoints here for clean grouping
router.post("/assign", requireOrganizer, assignReviewersAI);
router.get("/assignments", requireOrganizer, getAssignments);
router.post("/reassign", requireOrganizer, reassignReviewer);

// Generic results
router.get("/results", getResults);

module.exports = router;
