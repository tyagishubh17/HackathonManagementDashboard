const mongoose = require("mongoose");

const participantSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    college: { type: String, required: true, trim: true },
    skills: [{ type: String, trim: true }],
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team" },
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected", "duplicate"],
      default: "pending",
    },
    duplicateCheckResult: {
      score: Number,
      status: String,
      checkedAt: Date,
    },
  },
  { timestamps: true }
);

participantSchema.index({ email: 1 });
participantSchema.index({ phone: 1 });

module.exports = mongoose.model("Participant", participantSchema);
