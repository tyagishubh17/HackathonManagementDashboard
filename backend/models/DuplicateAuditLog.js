const mongoose = require("mongoose");

const duplicateAuditSchema = new mongoose.Schema(
  {
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
    reviewed_by: String,
  },
  { timestamps: true }
);

duplicateAuditSchema.index({ "candidate.email": 1 });
duplicateAuditSchema.index({ status: 1 });
duplicateAuditSchema.index({ createdAt: -1 });

module.exports = mongoose.model("DuplicateAuditLog", duplicateAuditSchema);
