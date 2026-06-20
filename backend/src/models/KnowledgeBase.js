const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const knowledgeBaseSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    documentType: {
      type: String,
      enum: ["rulebook", "faq", "schedule", "problem_statement", "custom"],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    originalFilename: { type: String },
    fileUrl: { type: String },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

knowledgeBaseSchema.index({ hackathonId: 1 });
knowledgeBaseSchema.index({ documentType: 1 });

// Soft delete
knowledgeBaseSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("KnowledgeBase", knowledgeBaseSchema);
