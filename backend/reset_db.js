require("dotenv").config();
const mongoose = require("mongoose");
const userRepository = require('../repositories/UserRepository');
const gmailSyncRepository = require('../repositories/GmailSyncRepository');
async function fixDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await gmailSyncRepository.updateOne(
    { email: "atharvanair09.ns@gmail.com" },
    { gmailConnected: false, googleTokens: null }
  );
  console.log(`Reset user: ${user.email} - gmailConnected is now false`);
  process.exit(0);
}
fixDb();
