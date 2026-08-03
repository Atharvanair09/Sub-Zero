const IncomeRepository = require('../../../repositories/IncomeRepository');
const Income = require('../../../models/Income');

jest.mock('../../../models/Income');

describe('IncomeRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call Income.findById', async () => {
      Income.findById.mockResolvedValue({ _id: '1' });
      const res = await IncomeRepository.findById('1');
      expect(Income.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
