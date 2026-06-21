const mongoose = require("mongoose");
require("dotenv").config();

const Registration = require("./src/models/Registration");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Create a dummy registration
  const reg = new Registration({
    hackathonId: new mongoose.Types.ObjectId(),
    userId: new mongoose.Types.ObjectId(),
    status: "pending_review",
    duplicateCheckResult: {
      isDuplicate: false,
      checkFailed: true,
      reasons: ["Test reason"],
      checkedAt: new Date()
    }
  });

  await reg.save();
  console.log("Saved registration ID:", reg._id);

  const fetched = await Registration.findById(reg._id).lean();
  console.log("Fetched duplicateCheckResult:", fetched.duplicateCheckResult);

  // Clean up
  await Registration.deleteOne({ _id: reg._id });
  console.log("Cleaned up dummy registration");

  await mongoose.disconnect();
}

main().catch(console.error);
