const mongoose = require('mongoose');
require('dotenv').config();
async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  const Transaction = require('./models/Transaction');
  const Notification = require('./models/Notification');
  
  const txns = await Transaction.find({ externalId: { $exists: true } });
  console.log('Total external txns:', txns.length);
  
  const uniqueTxns = new Map();
  const toDelete = [];
  
  for (const t of txns) {
    if (uniqueTxns.has(t.externalId)) {
      toDelete.push(t._id);
    } else {
      uniqueTxns.set(t.externalId, t);
    }
  }
  
  console.log('Duplicates to delete:', toDelete.length);
  if (toDelete.length > 0) {
    await Transaction.deleteMany({ _id: { $in: toDelete } });
    console.log('Deleted duplicate txns.');
  }
  
  // Also delete duplicate notifications for the same income_verification
  const notifs = await Notification.find({ type: 'income_verification' });
  const uniqueNotifs = new Map();
  const toDeleteNotifs = [];
  
  for (const n of notifs) {
    const key = n.title + n.message;
    if (uniqueNotifs.has(key)) {
      toDeleteNotifs.push(n._id);
    } else {
      uniqueNotifs.set(key, n);
    }
  }
  
  console.log('Duplicate notifs to delete:', toDeleteNotifs.length);
  if (toDeleteNotifs.length > 0) {
    await Notification.deleteMany({ _id: { $in: toDeleteNotifs } });
    console.log('Deleted duplicate notifs.');
  }

  process.exit(0);
}
run();
