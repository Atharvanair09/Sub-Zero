const FinancialHealthEngine = require('../../../domain/engines/FinancialHealthEngine');
const DateCycleEngine = require('../../../domain/engines/DateCycleEngine');

jest.mock('../../../domain/engines/DateCycleEngine');

describe('FinancialHealthEngine', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateItemHealthScore', () => {
    it('should calculate base score and apply penalties/bonuses', () => {
      DateCycleEngine.getCycleDays.mockReturnValue(30);
      
      const usageLogs = [
        '2025-05-01T10:00:00Z',
        '2025-05-01T12:00:00Z', // duplicate day
        '2025-05-02T10:00:00Z',
        '2025-05-03T10:00:00Z',
        '2025-05-04T10:00:00Z',
        '2025-05-05T10:00:00Z',
        '2025-05-06T10:00:00Z'
      ];
      
      // 6 unique days. 6 / 30 = 20%
      // Base score = 20.
      // usedRecently = true -> no penalty
      // price = 400 (< 500) and uniqueDays (6) > 5 -> +20 bonus
      // Total score = 40
      
      const score = FinancialHealthEngine.calculateItemHealthScore(usageLogs, 'monthly', true, 400);
      
      expect(score).toBe(40);
      expect(DateCycleEngine.getCycleDays).toHaveBeenCalledWith('monthly');
    });

    it('should apply penalty for not used recently', () => {
      DateCycleEngine.getCycleDays.mockReturnValue(30);
      const usageLogs = ['2025-05-01T10:00:00Z'];
      
      // 1 unique day. 1 / 30 = 3.33%
      // usedRecently = false -> -30 penalty
      // Total score before bounds = -26.67
      // Clamped to 0
      
      const score = FinancialHealthEngine.calculateItemHealthScore(usageLogs, 'monthly', false, 1000);
      
      expect(score).toBe(0);
    });

    it('should cap at 100', () => {
      DateCycleEngine.getCycleDays.mockReturnValue(7);
      const usageLogs = [
        '2025-05-01T10:00:00Z', '2025-05-02T10:00:00Z', '2025-05-03T10:00:00Z',
        '2025-05-04T10:00:00Z', '2025-05-05T10:00:00Z', '2025-05-06T10:00:00Z',
        '2025-05-07T10:00:00Z'
      ];
      // 7 unique days. 7 / 7 = 100%
      // usedRecently = true -> no penalty
      // price = 100 (< 500) and uniqueDays (7) > 5 -> +20 bonus
      // Total score = 120 -> clamped to 100
      
      const score = FinancialHealthEngine.calculateItemHealthScore(usageLogs, 'weekly', true, 100);
      
      expect(score).toBe(100);
    });
    
    it('should give 85 if 0 usage but usedRecently is somehow true (e.g., just bought)', () => {
       DateCycleEngine.getCycleDays.mockReturnValue(30);
       const score = FinancialHealthEngine.calculateItemHealthScore([], 'monthly', true, 1000);
       expect(score).toBe(85);
    });
  });

  describe('calculateTotalHealthScore', () => {
    it('should calculate average health score of all subscriptions', () => {
      DateCycleEngine.getCycleDays.mockReturnValue(30); // for simplicity
      const subscriptions = [
        { usageLogs: [], billingCycle: 'monthly', usedRecently: true, price: 1000 }, // score: 85
        { usageLogs: [], billingCycle: 'monthly', usedRecently: false, price: 1000 } // score: 0
      ];
      
      // Average = (85 + 0) / 2 = 42.5 -> rounded to 43
      
      const avg = FinancialHealthEngine.calculateTotalHealthScore(subscriptions);
      expect(avg).toBe(43);
    });

    it('should return 100 for empty or undefined subscriptions', () => {
      expect(FinancialHealthEngine.calculateTotalHealthScore([])).toBe(100);
      expect(FinancialHealthEngine.calculateTotalHealthScore(null)).toBe(100);
    });
  });

  describe('calculateUsageScore', () => {
    it('should calculate usage score based on recent logs', () => {
      DateCycleEngine.getCycleDays.mockReturnValue(30);
      DateCycleEngine.getDaysAgo.mockReturnValue(new Date('2025-04-15T00:00:00Z'));
      
      const usageLogs = [
        '2025-04-10T00:00:00Z', // older
        '2025-04-20T00:00:00Z', // recent
        '2025-04-21T00:00:00Z'  // recent
      ];
      
      const score = FinancialHealthEngine.calculateUsageScore(usageLogs, 'monthly', new Date('2025-05-15T00:00:00Z'));
      
      // 2 unique recent days out of 30 -> 2/30 = 0.0666...
      expect(score).toBeCloseTo(0.0666, 3);
    });
  });

  describe('calculatePotentialFoodSavings', () => {
    it('should calculate food savings correctly', () => {
      // (1000 / 5) * 2 * 4 = 200 * 8 = 1600
      expect(FinancialHealthEngine.calculatePotentialFoodSavings(1000, 5)).toBe(1600);
    });
  });

  describe('calculateUnusedSubscriptionSavings', () => {
    it('should calculate savings by summing prices of unused subs', () => {
      const unused = [
        { price: 500 },
        { price: 1200 }
      ];
      expect(FinancialHealthEngine.calculateUnusedSubscriptionSavings(unused)).toBe(1700);
    });
    
    it('should return 0 for empty array', () => {
        expect(FinancialHealthEngine.calculateUnusedSubscriptionSavings([])).toBe(0);
    });
  });
});
