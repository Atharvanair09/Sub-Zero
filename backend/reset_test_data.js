const mongoose = require('mongoose');
require('dotenv').config();

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected.');
  const User = require('./models/User');
  const Transaction = require('./models/Transaction');
  const Notification = require('./models/Notification');
  const IncomeCycle = require('./models/IncomeCycle');
  const IncomeSource = require('./models/IncomeSource');
  const user = await User.findOne({ email: 'atharvanair09.ns@gmail.com' });
  if (user) {
    const txns = await mongoose.model('Transaction').deleteMany({ userId: user._id, externalId: { $exists: true } });
    console.log('Deleted Txns:', txns.deletedCount);
    
    const notifs = await mongoose.model('Notification').deleteMany({ userId: user._id });
    console.log('Deleted Notifs:', notifs.deletedCount);
    
    const cycles = await mongoose.model('IncomeCycle').deleteMany({ userId: user._id });
    console.log('Deleted IncomeCycles:', cycles.deletedCount);
    
    const sources = await mongoose.model('IncomeSource').updateMany({ userId: user._id }, { $set: { lastReceivedDate: null } });
    console.log('Reset IncomeSources:', sources.modifiedCount);
  }
  process.exit(0);
}

run();
