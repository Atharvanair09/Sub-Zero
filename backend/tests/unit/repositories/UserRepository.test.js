const UserRepository = require('../../../repositories/UserRepository');
const User = require('../../../models/User');

jest.mock('../../../models/User');

describe('UserRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findOne', () => {
    it('should call User.findOne with correct filter', async () => {
      const filter = { email: 'test@example.com' };
      User.findOne.mockResolvedValue({ _id: '123' });
      const result = await UserRepository.findOne(filter);
      expect(User.findOne).toHaveBeenCalledWith(filter);
      expect(result).toEqual({ _id: '123' });
    });
  });

  describe('findById', () => {
    it('should call User.findById and select if provided', async () => {
      const mockQuery = {
        select: jest.fn().mockResolvedValue({ _id: '123' })
      };
      User.findById.mockReturnValue(mockQuery);
      
      const result = await UserRepository.findById('123', 'email');
      
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(mockQuery.select).toHaveBeenCalledWith('email');
      expect(result).toEqual({ _id: '123' });
    });

    it('should call User.findById without select', async () => {
      User.findById.mockResolvedValue({ _id: '123' });
      
      const result = await UserRepository.findById('123');
      
      expect(User.findById).toHaveBeenCalledWith('123');
      expect(result).toEqual({ _id: '123' });
    });
  });

  describe('create', () => {
    it('should call User.create', async () => {
      const data = { email: 'test@example.com' };
      User.create.mockResolvedValue({ _id: '123', ...data });
      const result = await UserRepository.create(data);
      expect(User.create).toHaveBeenCalledWith(data);
      expect(result).toHaveProperty('_id', '123');
    });
  });
  
  // Other methods (findMany, updateOne, updateById, deleteOne, deleteById, exists, count) follow same pattern
  describe('count', () => {
    it('should call User.countDocuments', async () => {
      const filter = { active: true };
      User.countDocuments.mockResolvedValue(5);
      const result = await UserRepository.count(filter);
      expect(User.countDocuments).toHaveBeenCalledWith(filter);
      expect(result).toBe(5);
    });
  });
});
