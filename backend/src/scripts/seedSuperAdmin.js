const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, "..", "..", ".env") });
const connectDB = require("../config/db");
const User = require("../models/User");

const seedSuperAdmin = async () => {
  try {
    await connectDB();
    console.log("Checking for existing Super Admin...");

    const existingAdmin = await User.findOne({ role: "super_admin" });
    if (existingAdmin) {
      console.log("Super Admin already exists. Aborting.");
      process.exit(0);
    }

    await User.create({
      fullName: "Super Admin",
      email: "admin@fairjudge.com",
      passwordHash: "Admin@123", // Hashes automatically
      role: "super_admin",
      superAdminDetails: { permissions: ["all"] },
    });

    console.log("Super Admin securely created!");
    process.exit(0);
  } catch (err) {
    console.error("Failed to seed Super Admin:", err);
    process.exit(1);
  }
};

seedSuperAdmin();
