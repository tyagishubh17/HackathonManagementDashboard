const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getMyTeams, joinTeam, leaveTeam } = require("../controllers/teamController");

const router = express.Router();

router.use(authenticate);

router.get("/my-teams", getMyTeams);
router.post("/:id/join", joinTeam);
router.post("/:id/leave", leaveTeam);

module.exports = router;
