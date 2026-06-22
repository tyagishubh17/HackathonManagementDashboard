const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const evaluationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    scores: {
      type: Map,
      of: Number, // Maps rubric criteria name to score
    },
    totalScore: { type: Number, required: true },
    normalizedScore: { type: Number },
    aiSuggestedScores: {
      type: Map,
      of: Number,
    },
    biasFlags: [String],
    feedback: String,
    status: {
      type: String,
      enum: ["draft", "submitted", "appealed", "resolved"],
      default: "draft",
    },
    appealReason: String,
    appealResponse: String,
    isFlagged: { type: Boolean, default: false },
    flagReason: String,
  },
  { timestamps: true }
);

evaluationSchema.index({ projectId: 1, reviewerId: 1 }, { unique: true, partialFilterExpression: { deleted: false } });
evaluationSchema.index({ hackathonId: 1 });

// Soft delete
evaluationSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Evaluation", evaluationSchema);
