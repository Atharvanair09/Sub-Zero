const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');
  const userRepository = require('../repositories/UserRepository');
  const transactionRepository = require('../repositories/TransactionRepository');
  const notificationRepository = require('./repositories/NotificationRepository');
  const incomeCycleRepository = require('./repositories/IncomeCycleRepository');
  const incomeRepository = require('./repositories/IncomeRepository');
  const user = await userRepository.findOne({ email: 'atharvanair09.ns@gmail.com' });
  if (user) {
    const txns = await transactionRepository.deleteMany({ userId: user._id, externalId: { $exists: true } });
    console.log('Deleted Txns:', txns.deletedCount);
    
    const notifs = await notificationRepository.deleteMany({ userId: user._id });
    console.log('Deleted Notifs:', notifs.deletedCount);
    
    const cycles = await incomeCycleRepository.deleteMany({ userId: user._id });
    console.log('Deleted IncomeCycles:', cycles.deletedCount);
    
    const sources = await incomeRepository.updateMany({ userId: user._id }, { $set: { lastReceivedDate: null } });
    console.log('Reset IncomeSources:', sources.modifiedCount);
  }
  process.exit(0);
}

run();
