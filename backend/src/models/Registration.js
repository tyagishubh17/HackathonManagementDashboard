const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const registrationSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    status: {
      type: String,
      enum: ["pending_review", "confirmed", "rejected", "waitlisted", "cancelled"],
      default: "pending_review",
    },
    // Participant Data snapshot
    experienceLevel: String,
    skills: [String],
    institution: String,
    country: String,
    gender: String,
    
    resumeText: String, // Extracted text for AI

    resumeFile: {
      driveFileId: String,
      fileName: String,
      mimeType: String,
      fileSize: Number,
      viewUrl: String,
      downloadUrl: String,
      uploadedAt: { type: Date, default: Date.now }
    },

    duplicateCheckResult: {
      isDuplicate: Boolean,
      confidence: Number,
      matchedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      matchedUserName: String,
      reasons: [String],
      checkedAt: Date,
    },

    // ==========================================
    // ADDED FOR FEATURE 1: 3-3 PANEL ASSIGNMENT
    // ==========================================
    assignedPanel: { 
      type: String, 
      enum: ["A", "B"], 
      default: null 
    },
    reviewers: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
    // ==========================================

    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: Date,
    reviewReason: String,

    cancelledAt: Date,
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    waitlistedAt: Date,
    waitlistPosition: Number,

    checkedInAt: Date,

    lastSeenProblemUpdate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Unique registration per user per hackathon
registrationSchema.index({ hackathonId: 1, userId: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
registrationSchema.index({ hackathonId: 1, status: 1 });
registrationSchema.index({ userId: 1, createdAt: -1 });

// Indexing additions to optimize Feature 1's lookups within evaluationController.js
registrationSchema.index({ teamId: 1, reviewers: 1 });

// Soft delete
registrationSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Registration", registrationSchema);