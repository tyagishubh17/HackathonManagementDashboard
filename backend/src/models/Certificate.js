const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const certificateSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["participation", "winner", "runner_up", "judge", "organizer"],
      required: true,
    },
    templateId: { type: String },
    certificateData: {
      type: Map,
      of: String, // Dynamic data like name, rank, etc.
    },
    pdfUrl: { type: String, required: true },
    issuedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

certificateSchema.index({ hackathonId: 1, userId: 1 }, { unique: true, partialFilterExpression: { deleted: false } });

// Soft delete
certificateSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Certificate", certificateSchema);
