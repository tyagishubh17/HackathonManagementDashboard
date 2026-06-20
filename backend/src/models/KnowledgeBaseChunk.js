const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const knowledgeBaseChunkSchema = new mongoose.Schema(
  {
    knowledgeBaseId: { type: mongoose.Schema.Types.ObjectId, ref: "KnowledgeBase", required: true },
    chunkIndex: { type: Number, required: true },
    text: { type: String, required: true },
    embedding: {
      type: [Number], // 1536-dimensional array
      required: true,
    },
    metadata: {
      type: Map,
      of: String,
    },
  },
  { timestamps: true }
);

knowledgeBaseChunkSchema.index({ knowledgeBaseId: 1, chunkIndex: 1 });

/*
CRITICAL: To enable Vector Search, create an Atlas Search Index on this collection via the MongoDB Atlas UI.
JSON Definition:
{
  "mappings": {
    "dynamic": true,
    "fields": {
      "embedding": {
        "dimensions": 1536,
        "similarity": "cosine",
        "type": "knnVector"
      }
    }
  }
}
*/

// Soft delete
knowledgeBaseChunkSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("KnowledgeBaseChunk", knowledgeBaseChunkSchema);
