const mongoose = require("mongoose");
const mongooseDelete = require("mongoose-delete");

const userSettingsSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
    },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    language: { type: String, default: "en" },
  },
  { timestamps: true }
);

// Soft delete
userSettingsSchema.plugin(mongooseDelete, { overrideMethods: "all", deletedAt: true });

module.exports = mongoose.model("UserSettings", userSettingsSchema);
