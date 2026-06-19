const mongoose = require("mongoose");

const biasAuditSchema = new mongoose.Schema(
  {
    reviewer_id: { type: String, required: true, index: true },
    project_id: { type: String, required: true },
    evaluation: mongoose.Schema.Types.Mixed,
    bias_detected: { type: Boolean, required: true },
    bias_type: String,
    bias_flags: [String],
    confidence: Number,
    recommended_action: String,
    analytics: mongoose.Schema.Types.Mixed,
    escalated: { type: Boolean, default: false },
    resolved: { type: Boolean, default: false },
    resolution_notes: String,
  },
  { timestamps: true }
);

biasAuditSchema.index({ reviewer_id: 1, createdAt: -1 });
biasAuditSchema.index({ bias_detected: 1 });

module.exports = mongoose.model("BiasAuditLog", biasAuditSchema);
