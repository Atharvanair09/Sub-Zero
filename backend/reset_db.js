require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function fixDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const user = await User.findOneAndUpdate(
    { email: "atharvanair09.ns@gmail.com" },
    { gmailConnected: false, googleTokens: null }
  );
  console.log(`Reset user: ${user.email} - gmailConnected is now false`);
  process.exit(0);
}
fixDb();
