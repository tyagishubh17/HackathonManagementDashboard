const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const duplicateAuditSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon" },
    candidate: {
      name: String,
      email: String,
      phone: String,
      college: String,
    },
    duplicate_score: { type: Number, required: true },
    status: { type: String, enum: ["Exact Duplicate", "Suspicious", "Unique"], required: true },
    best_match: mongoose.Schema.Types.Mixed,
    checked_against: Number,
    response_time_ms: Number,
    action_taken: {
      type: String,
      enum: ["auto_rejected", "flagged_for_review", "approved", "pending"],
      default: "pending",
    },
    reviewed_by: String, // Kept for backwards compatibility
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resolution: String,
  },
  { timestamps: true }
);

duplicateAuditSchema.index({ "candidate.email": 1 });
duplicateAuditSchema.index({ status: 1 });
duplicateAuditSchema.index({ createdAt: -1 });
duplicateAuditSchema.index({ hackathonId: 1 });

// Soft delete
duplicateAuditSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("DuplicateAuditLog", duplicateAuditSchema);
