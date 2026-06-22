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
  finalizePanels,
  calculateLeaderboard
} = require("../controllers/evaluationController");

const router = express.Router({ mergeParams: true });

// Apply authentication verification globally across all child endpoints
router.use(authenticate);

// =========================================================================
// 🛡️ STATIC ORGANIZER PATHS (Must be declared BEFORE dynamic /:id parameters)
// =========================================================================
// Match: POST /api/evaluations/assign-reviewers/:id -> triggers assignment matrix
router.post("/assign-reviewers/:id", requireOrganizer, assignReviewersAI);

router.post("/hackathons/:id/finalize-panels", requireOrganizer, finalizePanels);
router.post("/hackathons/:id/calculate-leaderboard", requireOrganizer, calculateLeaderboard);

// Match: GET /api/evaluations/hackathons/:id/reviewers -> matches frontend mount checks
router.get("/hackathons/:id/reviewers", requireOrganizer, getAssignments);

// Existing legacy entries kept for deep matrix mapping configurations
router.post("/assign", requireOrganizer, assignReviewersAI);
router.get("/assignments", requireOrganizer, getAssignments);
router.post("/reassign", requireOrganizer, reassignReviewer);

// Split panel visibility shield results
router.get("/results", getResults);

// =========================================================================
// 📋 JUDGE / PARTICIPANT ENTRIES (Declared after static routes)
// =========================================================================
router.get("/my-assignments", getMyAssignments);

// Dynamic variable routes catch traffic remaining from fallback sequences
router.get("/:id", getEvaluation);
router.post("/:id/score", scoreEvaluation);
router.put("/:id/submit", submitEvaluation);
router.post("/:id/ai-suggest", getAISuggestions);
router.post("/:id/appeal", appealEvaluation); 

// --- ORGANIZER EXTENSION VARIANT ---
router.put("/:id/appeal-review", requireOrganizer, reviewAppeal); 

module.exports = router;