const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const teamSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    name: { type: String, required: true, trim: true },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    problemStatementId: { type: mongoose.Schema.Types.ObjectId },
    skillDistribution: {
      type: Map,
      of: Number, // e.g. { "frontend": 2, "backend": 1 }
    },
    diversityScore: { type: Number, default: 0, min: 0, max: 100 },
    teamStrengthScore: { type: Number, default: 0, min: 0, max: 100 },
  },
  { timestamps: true }
);

teamSchema.index({ hackathonId: 1 });
teamSchema.index({ members: 1 });

// Soft delete
teamSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Team", teamSchema);
