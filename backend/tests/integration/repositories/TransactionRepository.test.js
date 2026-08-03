const mongoose = require('mongoose');
const { connect, closeDatabase, clearDatabase } = require('../setup-mongo');
const TransactionRepository = require('../../../repositories/TransactionRepository');
const UserRepository = require('../../../repositories/UserRepository');

describe('TransactionRepository (Integration)', () => {
  beforeAll(async () => {
    await connect();
  });

  afterEach(async () => {
    await clearDatabase();
  });

  afterAll(async () => {
    await closeDatabase();
  });

  it('should handle full CRUD lifecycle', async () => {
    const user = await UserRepository.create({ email: 'tx@example.com' });
    
    // Create
    const txnData = { 
      userId: user._id, 
      name: 'Amazon', 
      amount: 50, 
      category: 'Shopping',
      type: 'debit',
      date: new Date()
    };
    
    const txn = await TransactionRepository.create(txnData);
    expect(txn._id).toBeDefined();

    // Read
    const foundTxn = await TransactionRepository.findById(txn._id);
    expect(foundTxn.name).toBe('Amazon');

    // Update
    await TransactionRepository.findByIdAndUpdate(txn._id, { amount: 60 });
    const updatedTxn = await TransactionRepository.findById(txn._id);
    expect(updatedTxn.amount).toBe(60);

    // Delete
    await TransactionRepository.findByIdAndDelete(txn._id);
    const deletedTxn = await TransactionRepository.findById(txn._id);
    expect(deletedTxn).toBeNull();
  });

  it('should support aggregations', async () => {
    const user = await UserRepository.create({ email: 'agg@example.com' });
    
    await TransactionRepository.createMany([
      { userId: user._id, name: 'T1', amount: 100, type: 'debit', date: new Date() },
      { userId: user._id, name: 'T2', amount: 200, type: 'debit', date: new Date() },
      { userId: user._id, name: 'T3', amount: 50, type: 'credit', date: new Date() }
    ]);

    const pipeline = [
      { $match: { userId: user._id, type: 'debit' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ];

    const result = await TransactionRepository.aggregate(pipeline);
    expect(result).toHaveLength(1);
    expect(result[0].total).toBe(300);
  });
});
