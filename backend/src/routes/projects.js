const express = require("express");
const multer = require("multer");
const { authenticate } = require("../middleware/auth");
const {
  createProject,
  updateProject,
  uploadFiles,
  submitProject,
  getProject,
} = require("../controllers/projectController");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB per file
});

const router = express.Router({ mergeParams: true });

router.use(authenticate);

// Hackathon scoped POST (/api/hackathons/:id/projects)
router.post("/", createProject);

// Project scoped PUT/POST (/api/projects/:id)
router.put("/:id", updateProject);
router.post("/:id/submit", submitProject);
router.post("/:id/files", upload.array("files", 5), uploadFiles);
router.get("/:id", getProject);

module.exports = router;
