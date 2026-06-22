const express = require("express");
const { authenticate, requireSuperAdmin } = require("../middleware/auth");
const {
  getPendingHackathons,
  verifyHackathon,
  rejectHackathon,
  getAllHackathons,
  getHackathonFullDetails,
  getAnalyticsOverview,
  getAllUsers,
  updateUser,
  deleteUser,
  acknowledgeHackathonEdit,
  rejectHackathonEdit,
} = require("../controllers/adminController");

const router = express.Router();

// All Admin routes require super_admin privileges
router.use(authenticate);
router.use(requireSuperAdmin);

router.get("/analytics/overview", getAnalyticsOverview);
router.get("/users", getAllUsers);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.get("/hackathons/pending", getPendingHackathons);
router.get("/hackathons/all", getAllHackathons);
router.get("/hackathons/:id/full", getHackathonFullDetails);

router.post("/hackathons/:id/verify", verifyHackathon);
router.post("/hackathons/:id/reject", rejectHackathon);
router.post("/hackathons/:id/edits/acknowledge", acknowledgeHackathonEdit);
router.post("/hackathons/:id/edits/reject", rejectHackathonEdit);

module.exports = router;
