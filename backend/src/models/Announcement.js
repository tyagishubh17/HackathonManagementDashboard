const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const announcementSchema = new mongoose.Schema(
  {
    hackathonId: { type: mongoose.Schema.Types.ObjectId, ref: "Hackathon", required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: {
      type: String,
      enum: ["general", "urgent", "update", "result"],
      default: "general",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    targetAudience: {
      type: String,
      enum: ["all", "participants", "judges"],
      default: "all",
    },
    pinned: { type: Boolean, default: false },
    publishedAt: Date,
    readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

announcementSchema.index({ hackathonId: 1, publishedAt: -1 });

// Soft delete
announcementSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("Announcement", announcementSchema);
