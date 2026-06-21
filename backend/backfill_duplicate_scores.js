const mongoose = require("mongoose");
require("dotenv").config({ path: require("path").join(__dirname, ".env") });

const User = require("./src/models/User");
const Registration = require("./src/models/Registration");
const { checkDuplicate } = require("./src/services/aiService");

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB database:", mongoose.connection.name);

  // Find registrations that haven't been successfully duplicate-checked
  const registrations = await Registration.find({
    $or: [
      { duplicateCheckResult: null },
      { "duplicateCheckResult.confidence": { $exists: false } }
    ]
  }).populate("userId");

  console.log(`Found ${registrations.length} registrations to backfill.`);

  for (const reg of registrations) {
    if (!reg.userId) {
      console.log(`Skipping registration ${reg._id} as it has no user.`);
      continue;
    }

    const userData = {
      email: reg.userId.email,
      fullName: reg.userId.fullName,
      phone: reg.userId.phone || "",
      institution: reg.institution || "",
      skills: reg.skills || [],
      experienceLevel: reg.experienceLevel || "",
      resumeText: reg.resumeText || "",
    };

    try {
      // Find other confirmed participants in the same hackathon
      const existingParticipants = await Registration.find({
        hackathonId: reg.hackathonId,
        status: "confirmed",
        _id: { $ne: reg._id }
      })
      .populate("userId", "email fullName")
      .select("userId skills institution");

      console.log(`Checking duplicate for ${userData.fullName}...`);
      const aiResult = await checkDuplicate(userData, existingParticipants);

      if (aiResult) {
        const confidence = (aiResult.duplicate_score || 0) / 100;
        const isDuplicate = aiResult.status === "Exact Duplicate" || aiResult.status === "Suspicious";
        
        const matchedUserId = aiResult.best_match && mongoose.Types.ObjectId.isValid(aiResult.best_match.existing_id)
          ? new mongoose.Types.ObjectId(aiResult.best_match.existing_id)
          : undefined;
        const matchedUserName = aiResult.best_match ? aiResult.best_match.existing_name : undefined;

        let reasons = [];
        if (aiResult.best_match && aiResult.best_match.matching_fields) {
          reasons = aiResult.best_match.matching_fields.map(field => {
            const score = aiResult.best_match.field_scores?.[field];
            return score ? `Matched ${field} with ${score.toFixed(0)}% similarity` : `Matched ${field}`;
          });
        }

        reg.duplicateCheckResult = {
          isDuplicate,
          confidence,
          matchedUserId,
          matchedUserName,
          reasons,
          checkedAt: new Date(),
        };

        await reg.save();
        console.log(`  ✓ ${userData.fullName}: ${(confidence * 100).toFixed(0)}% — ${aiResult.status}`);
      }
    } catch (err) {
      console.error(`  ✗ Failed for ${userData.fullName}: ${err.message}`);
      reg.duplicateCheckResult = {
        isDuplicate: false,
        checkFailed: true,
        reasons: [],
        checkedAt: new Date(),
      };
      await reg.save();
    }
  }

  console.log("Backfill complete.");
  await mongoose.disconnect();
}

main().catch(console.error);
