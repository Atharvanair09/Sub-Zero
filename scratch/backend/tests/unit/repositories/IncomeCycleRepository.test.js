const IncomeCycleRepository = require('../../../repositories/IncomeCycleRepository');
const IncomeCycle = require('../../../models/IncomeCycle');

jest.mock('../../../models/IncomeCycle');

describe('IncomeCycleRepository (Unit)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should call IncomeCycle.findById', async () => {
      IncomeCycle.findById.mockResolvedValue({ _id: '1' });
      const res = await IncomeCycleRepository.findById('1');
      expect(IncomeCycle.findById).toHaveBeenCalledWith('1', null);
      expect(res._id).toBe('1');
    });
  });
});
