const GoalAllocationRepository = require('../../../repositories/GoalAllocationRepository');
const GoalAllocation = require('../../../models/GoalAllocation');

jest.mock('../../../models/GoalAllocation');

describe('GoalAllocationRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call GoalAllocation.findById', async () => {
      GoalAllocation.findById.mockResolvedValue({ _id: '1' });
      const res = await GoalAllocationRepository.findById('1');
      expect(GoalAllocation.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
