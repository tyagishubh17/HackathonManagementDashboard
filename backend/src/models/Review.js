const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer_id: { type: String, required: true, index: true },
    project_id: { type: String, required: true },
    innovation: { type: Number, required: true, min: 0, max: 100 },
    technical: { type: Number, required: true, min: 0, max: 100 },
    presentation: { type: Number, required: true, min: 0, max: 100 },
    final_score: { type: Number, required: true, min: 0, max: 100 },
    tech_stack: [{ type: String }],
    biasCheckResult: {
      bias_detected: Boolean,
      bias_type: String,
      confidence: Number,
      recommended_action: String,
      checkedAt: Date,
    },
    normalized_score: Number,
  },
  { timestamps: true }
);

reviewSchema.index({ reviewer_id: 1, project_id: 1 });

module.exports = mongoose.model("Review", reviewSchema);
