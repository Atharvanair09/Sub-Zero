require("dotenv").config();
const mongoose = require("mongoose");
const transactionRepository = require("./repositories/TransactionRepository");
async function clearOld() {
  await mongoose.connect(process.env.MONGODB_URI);
  const userRepository = require('./repositories/UserRepository');
  const user = await userRepository.findOne({ email: "atharvanair09.ns@gmail.com" });
  
  if (user) {
    const result = await transactionRepository.deleteMany({ 
      userId: user._id, 
      externalId: { $exists: true } 
    });
    console.log(`Deleted ${result.deletedCount} old auto-imported transactions.`);
  }
  process.exit(0);
}
clearOld();
