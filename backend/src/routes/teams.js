const express = require("express");
const { authenticate, requireOrganizer } = require("../middleware/auth");
const {
  formTeamsAI,
  createTeam,
  getAllTeams,
  updateTeam,
  disbandTeam,
} = require("../controllers/teamController");

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Hackathon-scoped team routes (/api/hackathons/:id/teams)
router.post("/form", requireOrganizer, formTeamsAI);
router.post("/", createTeam); // Manual creation by participant or organizer? Let's say participant can form teams manually too
router.get("/", getAllTeams);
router.put("/:teamId", updateTeam);
router.delete("/:teamId", disbandTeam);

module.exports = router;
