const mongoose = require("mongoose");
require("dotenv").config();

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB database name:", mongoose.connection.name);
  await mongoose.disconnect();
}

main().catch(console.error);
