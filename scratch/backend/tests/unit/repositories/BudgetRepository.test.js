const BudgetRepository = require('../../../repositories/BudgetRepository');
const Budget = require('../../../models/Budget');

jest.mock('../../../models/Budget');

describe('BudgetRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Budget.findById', async () => {
      Budget.findById.mockResolvedValue({ _id: '1' });
      const res = await BudgetRepository.findById('1');
      expect(Budget.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
