const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const activityLogSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    entityType: { type: String }, // e.g., 'Hackathon', 'Project', 'User'
    entityId: { type: mongoose.Schema.Types.ObjectId },
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
  },
  { timestamps: true }
);

activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ entityType: 1, entityId: 1 });

// Soft delete
activityLogSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("ActivityLog", activityLogSchema);
