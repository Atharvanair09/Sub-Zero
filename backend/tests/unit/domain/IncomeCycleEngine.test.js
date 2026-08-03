const IncomeCycleEngine = require('../../../domain/engines/IncomeCycleEngine');
const DateCycleEngine = require('../../../domain/engines/DateCycleEngine');

jest.mock('../../../domain/engines/DateCycleEngine');

describe('IncomeCycleEngine', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCycleId', () => {
    it('should call DateCycleEngine.getCycleIdentifier', () => {
      DateCycleEngine.getCycleIdentifier.mockReturnValue('2025-05');
      
      const result = IncomeCycleEngine.getCycleId('monthly', '2025-05-15');
      
      expect(DateCycleEngine.getCycleIdentifier).toHaveBeenCalledWith('monthly', '2025-05-15');
      expect(result).toBe('2025-05');
    });
  });
});
