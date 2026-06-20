const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const biasAuditLogSchema = new mongoose.Schema(
  {
    evaluationId: { type: mongoose.Schema.Types.ObjectId, ref: "Evaluation", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    detectedBiases: [String], // Array of bias types or flags returned by AI
    reviewerFeedback: String, // The text that triggered the bias alert
    scoresSnapshot: {
      type: Map,
      of: Number,
    },
    aiConfidence: Number,
    actionTaken: {
      type: String,
      enum: ["flagged_only", "warning_issued", "evaluation_rejected", "reviewer_suspended"],
      default: "flagged_only",
    },
    resolved: { type: Boolean, default: false },
    resolutionNotes: String,
    resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

biasAuditLogSchema.index({ hackathonId: 1 });
biasAuditLogSchema.index({ reviewerId: 1 });

// Soft delete
biasAuditLogSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("BiasAuditLog", biasAuditLogSchema);
