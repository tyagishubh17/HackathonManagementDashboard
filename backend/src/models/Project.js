const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const projectSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    teamId: { type: mongoose.Schema.Types.ObjectId, ref: "Team", required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    problemStatementId: { type: mongoose.Schema.Types.ObjectId },
    techStack: [String],
    pptFile: {
      fileId: String,
      fileName: String,
      mimeType: String,
      viewUrl: String,
      downloadUrl: String,
    },
    summary: { type: String },
    videoLink: { type: String },
    status: {
      type: String,
      enum: ["draft", "submitted", "disqualified"],
      default: "draft",
    },
  },
  { timestamps: true }
);

projectSchema.index({ hackathonId: 1 });
projectSchema.index({ teamId: 1 });
projectSchema.index({ title: "text", description: "text" }); // Text index for search

// Soft delete
projectSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Project", projectSchema);
