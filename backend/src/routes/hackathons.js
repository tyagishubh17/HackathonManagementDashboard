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
  downloadProblemStatementFile,
  postAnnouncement,
  deleteAnnouncement,
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

// ==========================================
// 1. PUBLIC ROUTES (No Authentication Required)
// ==========================================
router.get("/", getPublicHackathons);
router.get("/:id/public", getPublicHackathonById);
router.get("/:id/problem-statements/:problemId/download", downloadProblemStatementFile);

// Mount nested routers
router.use("/:id/registrations", registrationRouter);
router.use("/:id/teams", teamsRouter);
router.use("/:id/projects", projectsRouter);

// ==========================================
// 2. ENFORCE AUTHENTICATION CHECKPOINT
// ==========================================
// Every route declared below this line will successfully parse the user token!
router.use(authenticate);

// ==========================================
// 3. REVIEWER & EVALUATION ENDPOINTS (Protected)
// ==========================================
const { assignReviewersAI, getAssignments, reassignReviewer, getResults, computeResults } = require("../controllers/evaluationController");
router.post("/:id/reviewers/assign", requireOrganizer, assignReviewersAI);
router.get("/:id/reviewers/assignments", requireOrganizer, getAssignments);
router.get("/:id/results", getResults);
router.post("/:id/results/compute", requireOrganizer, computeResults);

const { publishResults, getHackathonCertificates } = require("../controllers/certificateController");
router.post("/:id/publish-results", requireOrganizer, publishResults);
router.get("/:id/certificates", requireOrganizer, getHackathonCertificates);

// ==========================================
// 4. CORE ORGANIZER / PARTICIPANT ENDPOINTS
// ==========================================
// Aliases used by the frontend
router.get("/my-hackathons", requireOrganizer, getMyHackathons);
router.get("/organizer/my-hackathons", requireOrganizer, getMyHackathons);
router.get("/my-registrations", authenticate, require("../controllers/registrationController").getMyAllRegistrations);
router.post("/:id/register", upload.single("resume"), registerForHackathon);
router.get("/:id/my-registration", getMyRegistration);

router.post("/", requireOrganizer, createHackathon);
router.get("/:id", getHackathonById); 
router.put("/:id", updateHackathon); 
router.delete("/:id", deleteHackathon);

// Actions
router.post("/:id/publish", requireOrganizer, publishHackathon);
router.post("/:id/problem-statements", requireOrganizer, upload.single("referenceFile"), addProblemStatement);
router.put("/:id/problem-statements/:problemId", requireOrganizer, upload.single("referenceFile"), updateProblemStatement);
router.delete("/:id/problem-statements/:problemId", requireOrganizer, deleteProblemStatement);

router.post("/:id/announcements", requireOrganizer, postAnnouncement);
router.delete("/:id/announcements/:announcementId", requireOrganizer, deleteAnnouncement);

module.exports = router;