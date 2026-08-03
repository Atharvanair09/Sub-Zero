const TransactionRepository = require('../../../repositories/TransactionRepository');
const Transaction = require('../../../models/Transaction');

jest.mock('../../../models/Transaction');

describe('TransactionRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Transaction.findById', async () => {
      Transaction.findById.mockResolvedValue({ _id: '1' });
      const res = await TransactionRepository.findById('1');
      expect(Transaction.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });

  describe('findMany', () => {
    it('should apply all options correctly', async () => {
      const mockQuery = {
        select: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        collation: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([{ _id: '1' }])
      };
      
      Transaction.find.mockReturnValue(mockQuery);
      
      const filter = { userId: '123' };
      const options = {
        projection: 'amount',
        sort: { date: -1 },
        limit: 10,
        skip: 5,
        populate: 'categoryId',
        collation: { locale: 'en' },
        lean: true
      };
      
      const res = await TransactionRepository.findMany(filter, options);
      
      expect(Transaction.find).toHaveBeenCalledWith(filter);
      expect(mockQuery.select).toHaveBeenCalledWith(options.projection);
      expect(mockQuery.sort).toHaveBeenCalledWith(options.sort);
      expect(mockQuery.limit).toHaveBeenCalledWith(options.limit);
      expect(mockQuery.skip).toHaveBeenCalledWith(options.skip);
      expect(mockQuery.populate).toHaveBeenCalledWith(options.populate);
      expect(mockQuery.collation).toHaveBeenCalledWith(options.collation);
      expect(mockQuery.lean).toHaveBeenCalled();
      
      expect(res).toEqual([{ _id: '1' }]);
    });
  });

  describe('aggregate', () => {
    it('should call Transaction.aggregate', async () => {
      const pipeline = [{ $match: { amount: { $gt: 100 } } }];
      Transaction.aggregate.mockResolvedValue([{ total: 500 }]);
      const res = await TransactionRepository.aggregate(pipeline);
      expect(Transaction.aggregate).toHaveBeenCalledWith(pipeline);
      expect(res).toEqual([{ total: 500 }]);
    });
  });

  describe('bulkWrite', () => {
    it('should call Transaction.bulkWrite', async () => {
      const ops = [{ insertOne: { document: { amount: 100 } } }];
      Transaction.bulkWrite.mockResolvedValue({ insertedCount: 1 });
      const res = await TransactionRepository.bulkWrite(ops);
      expect(Transaction.bulkWrite).toHaveBeenCalledWith(ops);
      expect(res.insertedCount).toBe(1);
    });
  });
});
