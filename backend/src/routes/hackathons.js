const express = require("express");
const multer = require("multer");
const { authenticate, requireOrganizer } = require("../middleware/auth");
const {
  createHackathon,
  getMyHackathons,
  getHackathonById,
  updateHackathon,
  deleteHackathon,
  publishHackathon,
  addProblemStatement,
  updateProblemStatement,
  deleteProblemStatement,
  getPublicHackathons,
  getPublicHackathonById,
} = require("../controllers/hackathonController");

const router = express.Router();

const registrationRouter = require("./registrations");
const teamsRouter = require("./teams");
const projectsRouter = require("./projects");
const { registerForHackathon, getMyRegistration } = require("../controllers/registrationController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Public Routes (No Auth)
router.get("/", getPublicHackathons);
router.get("/:id/public", getPublicHackathonById);

// Mount nested routers
router.use("/:id/registrations", registrationRouter);
router.use("/:id/teams", teamsRouter);
router.use("/:id/projects", projectsRouter);

const { assignReviewersAI, getAssignments, reassignReviewer, getResults } = require("../controllers/evaluationController");
router.post("/:id/reviewers/assign", requireOrganizer, assignReviewersAI);
router.get("/:id/reviewers/assignments", requireOrganizer, getAssignments);
router.post("/:id/reviewers/reassign", requireOrganizer, reassignReviewer);
router.get("/:id/results", getResults);

// Organizer Routes (Requires Auth & Organizer Role)
// We apply authenticate to all below.
router.use(authenticate);

// Aliases used by the frontend (must be before /:id)
router.get("/my-hackathons", requireOrganizer, getMyHackathons);
router.get("/organizer/my-hackathons", requireOrganizer, getMyHackathons);
router.post("/:id/register", upload.single("resume"), registerForHackathon);
router.get("/:id/my-registration", getMyRegistration);

router.post("/", requireOrganizer, createHackathon);
router.get("/:id", getHackathonById); // Admin or Organizer handles it inside
router.put("/:id", updateHackathon); // Organizer or Admin
router.delete("/:id", deleteHackathon);

// Actions
router.post("/:id/publish", requireOrganizer, publishHackathon);
router.post("/:id/problem-statements", requireOrganizer, addProblemStatement);
router.put("/:id/problem-statements/:problemId", requireOrganizer, updateProblemStatement);
router.delete("/:id/problem-statements/:problemId", requireOrganizer, deleteProblemStatement);

module.exports = router;
