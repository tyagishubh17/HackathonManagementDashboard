const express = require("express");
const {
  register,
  login,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  getMe,
} = require("../controllers/authController");
const { authLimiter } = require("../middleware/rateLimiter");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/refresh", refresh);
router.post("/logout", authenticate, logout);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password/:resettoken", authLimiter, resetPassword);
router.get("/me", authenticate, getMe);

// OAuth flows (Placeholders for manual state validation implementation)
router.get("/google", (req, res) => {
  const state = require("crypto").randomBytes(16).toString("hex");
  // Store state in cookie for OAuth CSRF validation
  res.cookie("oauth_state", state, { httpOnly: true });
  // redirect to google oauth with state
  res.status(200).json({ message: "Redirecting to Google OAuth..." });
});

module.exports = router;
