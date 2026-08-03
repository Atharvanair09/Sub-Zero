const GoalRepository = require('../../../repositories/GoalRepository');
const Goal = require('../../../models/Goal');

jest.mock('../../../models/Goal');

describe('GoalRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Goal.findById', async () => {
      Goal.findById.mockResolvedValue({ _id: '1' });
      const res = await GoalRepository.findById('1');
      expect(Goal.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
