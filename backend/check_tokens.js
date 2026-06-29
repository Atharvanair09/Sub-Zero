require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const users = await User.find({});
  for (const user of users) {
    console.log(`User Email: ${user.email}`);
    console.log(`  gmailConnected: ${user.gmailConnected}`);
    console.log(`  googleTokens: ${user.googleTokens ? "EXISTS" : "NULL"}`);
    if (user.googleTokens) {
      console.log(`  refresh_token: ${user.googleTokens.refresh_token ? "YES" : "NO"}`);
      console.log(`  access_token: ${user.googleTokens.access_token ? "YES" : "NO"}`);
      console.log(`  scopes: ${user.googleTokens.scope}`);
    }
  }
  process.exit(0);
}
checkDb();
