const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

const authenticate = async (req, res, next) => {
  let token;

  // Extract token from header or cookies
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies && req.cookies.accessToken) {
    token = req.cookies.accessToken; // fallback for potential future use
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: "Token has been revoked. Please log in again." });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to req
    req.user = await User.findById(decoded.id).select("-passwordHash");
    if (!req.user) {
      return res.status(401).json({ message: "User not found" });
    }

    // Check if account is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: "Account is temporarily locked. Try again later." });
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Not authorized, token failed" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Aliases
const requireSuperAdmin = authorize("super_admin");
const requireOrganizer = authorize("organizer", "super_admin");
const requireJudge = authorize("judge", "organizer", "super_admin");
const requireParticipant = authorize("participant", "super_admin");

module.exports = {
  authenticate,
  authorize,
  requireSuperAdmin,
  requireOrganizer,
  requireJudge,
  requireParticipant,
};
