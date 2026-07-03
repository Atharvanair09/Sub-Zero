require("dotenv").config();
const mongoose = require("mongoose");
const Transaction = require("./models/Transaction");

async function clearOld() {
  await mongoose.connect(process.env.MONGODB_URI);
  const User = require("./models/User");
  const user = await User.findOne({ email: "atharvanair09.ns@gmail.com" });
  
  if (user) {
    const result = await Transaction.deleteMany({ 
      userId: user._id, 
      externalId: { $exists: true } 
    });
    console.log(`Deleted ${result.deletedCount} old auto-imported transactions.`);
  }
  process.exit(0);
}
clearOld();
