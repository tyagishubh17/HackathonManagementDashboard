const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const chatMessageSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    conversationId: { type: String, required: true, index: true },
    role: {
      type: String,
      enum: ["user", "assistant", "system"],
      required: true,
    },
    content: { type: String, required: true },
    sources: [
      {
        documentId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeBase" },
        chunkId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeBaseChunk" },
        relevanceScore: Number,
      },
    ],
  },
  { timestamps: true }
);

chatMessageSchema.index({ hackathonId: 1, userId: 1 });
chatMessageSchema.index({ conversationId: 1, createdAt: 1 });

// TTL Index: Auto-expiry after 30 days
chatMessageSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// Soft delete
chatMessageSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
