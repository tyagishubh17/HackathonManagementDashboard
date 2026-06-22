const cron = require("node-cron");
const Hackathon = require("../models/Hackathon");
const User = require("../models/User");
const sendEmail = require("../utils/email"); // In a real app, send transition notifications if needed

// Run every hour at minute 0
const startCronJob = () => {
  cron.schedule("0 * * * *", async () => {
    try {
      console.log("Running Hackathon Status Cron Job...");
      const now = new Date();

      // upcoming -> registration_open
      const upcoming = await Hackathon.find({
        status: "upcoming",
        "timeline.registrationStart": { $lte: now },
      });
      for (const h of upcoming) {
        h.status = "registration_open";
        await h.save();
        console.log(`Hackathon ${h._id} opened for registration.`);
      }

      // registration_open -> ongoing
      const regOpen = await Hackathon.find({
        status: "registration_open",
        "timeline.registrationEnd": { $lte: now },
        "timeline.hackathonStart": { $lte: now },
      });
      for (const h of regOpen) {
        h.status = "ongoing";
        await h.save();
        console.log(`Hackathon ${h._id} is now ongoing.`);
      }

      // ongoing -> evaluating
      const ongoing = await Hackathon.find({
        status: "ongoing",
        "timeline.hackathonEnd": { $lte: now },
      });
      for (const h of ongoing) {
        h.status = "evaluating";
        await h.save();
        console.log(`Hackathon ${h._id} moved to evaluating.`);
      }

      // Note: evaluating -> completed might require manual trigger or an evaluationEnd field if added.
      
    } catch (err) {
      console.error("Cron Job Error:", err);
    }
  });
};

module.exports = startCronJob;
