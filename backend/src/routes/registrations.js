const express = require("express");
const multer = require("multer");
const { authenticate } = require("../middleware/auth");
const {
  registerForHackathon,
  getMyRegistration,
  cancelRegistration,
  getRegistrations,
  exportRegistrations,
  updateRegistrationStatus,
  getRegistrationStats,
  acknowledgeProblemUpdate,
  downloadResumeFile,
  sendEmailToParticipants,
  getMyAllRegistrations,
} = require("../controllers/registrationController");
const Hackathon = require("../models/Hackathon");

// Setup multer for memory storage (we upload buffer to Google Drive)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Need to allow dynamic requireOrganizer logic since ID is a param
const requireOrganizerOrSuperAdmin = async (req, res, next) => {
  if (req.user.role === "super_admin") return next();
  
  if (req.user.role === "organizer") {
    const hackathon = await Hackathon.findById(req.params.id);
    if (hackathon && hackathon.organizerId.toString() === req.user._id.toString()) {
      return next();
    }
  }
  return res.status(403).json({ message: "Not authorized to manage this hackathon" });
};

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Participant routes
router.post("/register", upload.single("resume"), registerForHackathon);
router.get("/my-registration", getMyRegistration);
router.get("/mine/all", getMyAllRegistrations);
router.delete("/register", cancelRegistration);
router.post("/my-registration/acknowledge-update", acknowledgeProblemUpdate);

// Organizer routes
router.get("/", requireOrganizerOrSuperAdmin, getRegistrations);
router.get("/export", requireOrganizerOrSuperAdmin, exportRegistrations);
router.get("/stats", requireOrganizerOrSuperAdmin, getRegistrationStats);
router.post("/email", requireOrganizerOrSuperAdmin, sendEmailToParticipants);
router.put("/:registrationId/status", requireOrganizerOrSuperAdmin, updateRegistrationStatus);
router.get("/:registrationId/resume", requireOrganizerOrSuperAdmin, downloadResumeFile);

module.exports = router;
