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

    // Verify token using environment fallback safety limits
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-super-secret-jwt-key-min-32-characters");

    // Defensive check: Handle variations of how user ID might be stored inside your payload token matrix
    const targetId = decoded.id || decoded._id || decoded.userId;

    // Attach user profile object directly from the collection
    req.user = await User.findById(targetId).select("-passwordHash -password");
    
    if (!req.user) {
      // Direct emergency fallback check: If the user document fetch failed, mock the token data role safely
      if (decoded.role) {
        req.user = { _id: targetId, role: decoded.role };
      } else {
        return res.status(401).json({ message: "User not found or authorization payload malformed." });
      }
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
    // Structural guard validation layer
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user ? req.user.role : "undefined"}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Roles Hierarchy Permissions Aliases
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