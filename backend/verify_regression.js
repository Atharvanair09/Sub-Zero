require('dotenv').config();
const mongoose = require('mongoose');
const transactionRepository = require('./repositories/TransactionRepository');

async function testRegression() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const userId = new mongoose.Types.ObjectId();

  try {
    // 1. Simulate new transaction creation
    const newTxnData = {
      userId,
      name: 'HDFC CREDIT',
      amount: 500,
      category: 'Bank Transaction',
      type: 'credit',
      externalId: 'test_msg_1',
      date: new Date()
    };
    
    console.log('Simulating new transaction creation...');
    const createdTxn = await transactionRepository.create(newTxnData);
    console.log('Created:', createdTxn._id);

    // 2. Simulate duplicate lookup
    console.log('Simulating duplicate lookup...');
    const duplicate = await transactionRepository.findOne({ userId, externalId: 'test_msg_1' });
    if (duplicate) {
        console.log('Duplicate detected correctly.');
    } else {
        throw new Error('Duplicate detection failed.');
    }

    // 3. Simulate Transaction update behaves identically (save)
    console.log('Simulating duplicate update (name refinement)...');
    await transactionRepository.updateOne(
        { _id: duplicate._id },
        { $set: { name: 'AMAZON PAY' } }
    );
    
    const updated = await transactionRepository.findById(duplicate._id);
    console.log('Updated name:', updated.name);
    if (updated.name !== 'AMAZON PAY') throw new Error('Update failed.');

    // 4. Simulate Transaction deletion behaves identically
    console.log('Simulating deletion...');
    const delResult = await transactionRepository.deleteMany({ _id: duplicate._id });
    console.log('Deleted count:', delResult.deletedCount);
    if (delResult.deletedCount !== 1) throw new Error('Deletion failed.');

    console.log('All regression workflows passed successfully.');
  } catch (error) {
    console.error('Regression Test Failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testRegression();
