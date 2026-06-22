const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const mongooseDelete = require("mongoose-delete");

const sessionSchema = new mongoose.Schema({
  deviceId: String,
  ip: String,
  userAgent: String,
  lastActive: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ["participant", "organizer", "judge", "super_admin"],
      required: true,
    },
    authProvider: { type: String, enum: ["local", "google", "github"], default: "local" },
    
    // Security tracking
    loginAttempts: { type: Number, required: true, default: 0 },
    lockUntil: { type: Date },
    passwordHistory: [{ type: String }], // To prevent reuse of last 5 passwords
    
    // Verification & Reset
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: String,
    emailVerificationExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Sessions tracking
    sessions: [sessionSchema],

    profile: {
      avatarUrl: String,
      bio: String,
      linkedIn: String,
      github: String,
    },
    participantDetails: {
      skills: [String],
      resume: String,
      experience: String,
    },
    organizerDetails: {
      organization: String,
      verified: { type: Boolean, default: false },
    },
    judgeDetails: {
      expertise: [String],
      yearsOfExperience: Number,
      evaluationHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Evaluation" }],
    },
    superAdminDetails: {
      permissions: [String],
    },
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ role: 1 });
userSchema.index({ fullName: "text", email: "text" }); // Text index for search

// Soft delete
userSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

// Password hashing pre-save hook
userSchema.pre("save", async function (next) {
  if (!this.isModified("passwordHash")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    const hashed = await bcrypt.hash(this.passwordHash, salt);
    this.passwordHash = hashed;
    this.passwordHistory.push(hashed);
    if (this.passwordHistory.length > 5) {
      this.passwordHistory.shift();
    }
    next();
  } catch (err) {
    next(err);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

// Increment login attempts and lock account if needed
userSchema.methods.incrementLoginAttempts = function () {
  // If lock expired, reset attempts
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 }
    });
  }
  // Otherwise increment
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock the account if attempts exceed 4 (making it 5)
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // 15 mins lock
  }
  return this.updateOne(updates);
};

// Check if locked
userSchema.virtual("isLocked").get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

module.exports = mongoose.model("User", userSchema);
