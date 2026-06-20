const User = require("../models/User");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { blacklistToken } = require("../utils/tokenBlacklist");
const sendEmail = require("../utils/email");

const generateTokens = (id) => {
  const accessToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" });
  const refreshToken = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRE || "7d" });
  return { accessToken, refreshToken };
};

const sendTokenResponse = async (user, req, res) => {
  const { accessToken, refreshToken } = generateTokens(user._id);

  // Track session
  const session = {
    deviceId: crypto.randomBytes(16).toString("hex"),
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  };
  user.sessions.push(session);
  await user.save({ validateBeforeSave: false });

  // Refresh token in httpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  res.status(200).json({
    success: true,
    accessToken,
    role: user.role,
    user: {
      id: user._id,
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, fullName, role, participantDetails, organizerDetails, judgeDetails } = req.body;

    // Validate strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(password)) {
      return res.status(400).json({ message: "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character." });
    }

    // Role-specific validation
    if (role === "participant" && (!participantDetails?.skills || !participantDetails?.experience)) {
      return res.status(400).json({ message: "Participants require skills and experience level." });
    }
    if (role === "organizer" && !organizerDetails?.organization) {
      return res.status(400).json({ message: "Organizers require an organization name." });
    }
    if (role === "judge" && (!judgeDetails?.expertise || !judgeDetails?.yearsOfExperience)) {
      return res.status(400).json({ message: "Judges require expertise and years of experience." });
    }

    const emailVerificationToken = crypto.randomBytes(20).toString("hex");

    const user = await User.create({
      email,
      passwordHash: password,
      fullName,
      role,
      participantDetails,
      organizerDetails,
      judgeDetails,
      emailVerificationToken: crypto.createHash("sha256").update(emailVerificationToken).digest("hex"),
      emailVerificationExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verifyemail/${emailVerificationToken}`;
    const message = `Please verify your email by clicking: \n\n ${verifyUrl}`;

    try {
      await sendEmail({ email: user.email, subject: "Verify your Email", message });
    } catch (err) {
      console.error(err);
      user.emailVerificationToken = undefined;
      user.emailVerificationExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }

    sendTokenResponse(user, req, res);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Please provide an email and password" });

    const user = await User.findOne({ email }).select("+passwordHash +loginAttempts +lockUntil");
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    if (user.isLocked) {
      return res.status(403).json({ message: "Account locked. Try again after 15 minutes." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Reset attempts on successful login
    if (user.loginAttempts > 0) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
      await user.save({ validateBeforeSave: false });
    }

    sendTokenResponse(user, req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) return res.status(401).json({ message: "Not authorized to refresh" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    const { accessToken } = generateTokens(user._id);
    res.status(200).json({ success: true, accessToken });
  } catch (err) {
    res.status(401).json({ message: "Invalid refresh token" });
  }
};

exports.logout = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1];
    if (accessToken) {
      blacklistToken(accessToken, 15 * 60);
    }

    // Optional: Pull session from DB using device tracking if passed

    res.cookie("refreshToken", "none", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });
    res.status(200).json({ success: true, message: "Logged out securely" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json({ message: "No user with that email" });

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/resetpassword/${resetToken}`;
    const message = `Reset your password by clicking: \n\n ${resetUrl}`;

    try {
      await sendEmail({ email: user.email, subject: "Password Reset Token", message });
      res.status(200).json({ success: true, data: "Email sent" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: "Email could not be sent" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resettoken).digest("hex");
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    // Validate strong password
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongPasswordRegex.test(req.body.password)) {
      return res.status(400).json({ message: "Password does not meet strength requirements" });
    }

    // Check history
    for (const oldPassHash of user.passwordHistory) {
      if (await bcrypt.compare(req.body.password, oldPassHash)) {
        return res.status(400).json({ message: "Cannot reuse the last 5 passwords" });
      }
    }

    user.passwordHash = req.body.password; // hook hashes it
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    // Will be hashed pre-save, we need to push hash manually but pre-save does it if modified.
    // So we push plain text, pre-save hook won't hash array items automatically unless we script it.
    // Actually, bcrypt hook only hashes this.passwordHash. We'll let pre-save run, then we push to history manually in hook or here.
    const salt = await bcrypt.genSalt(12);
    const newHash = await bcrypt.hash(req.body.password, salt);
    user.passwordHash = newHash;
    user.passwordHistory.push(newHash);
    if (user.passwordHistory.length > 5) user.passwordHistory.shift();

    await user.save({ validateBeforeSave: false });
    sendTokenResponse(user, req, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, data: user });
};
