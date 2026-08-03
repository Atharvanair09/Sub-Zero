const CashFlowEngine = require('../../../domain/engines/CashFlowEngine');

describe('CashFlowEngine', () => {
  describe('calculateRemainingAvailableIncome', () => {
    it('should correctly calculate remaining income', () => {
      const remaining = CashFlowEngine.calculateRemainingAvailableIncome(10000, 2000, 3000, 1500);
      expect(remaining).toBe(3500);
    });

    it('should handle zero values', () => {
      const remaining = CashFlowEngine.calculateRemainingAvailableIncome(0, 0, 0, 0);
      expect(remaining).toBe(0);
    });
  });

  describe('calculateTotalExpenses', () => {
    it('should sum transaction amounts', () => {
      const txns = [
        { amount: 100 },
        { amount: 250 },
        { amount: 50 },
        { amount: null } // Handle null gracefully
      ];
      expect(CashFlowEngine.calculateTotalExpenses(txns)).toBe(400);
    });

    it('should return 0 for empty array', () => {
      expect(CashFlowEngine.calculateTotalExpenses([])).toBe(0);
    });
  });

  describe('calculateMonthlySubscriptionSpend', () => {
    it('should correctly calculate monthly spend for different billing cycles', () => {
      const subs = [
        { billingCycle: 'monthly', price: 500 },
        { billingCycle: 'yearly', price: 1200 },
        { billingCycle: 'monthly', price: 100 }
      ];
      // 500 + (1200/12) + 100 = 700
      expect(CashFlowEngine.calculateMonthlySubscriptionSpend(subs)).toBe(700);
    });
  });

  describe('calculateYearlyProjection', () => {
    it('should calculate yearly projection based on monthly spends', () => {
      expect(CashFlowEngine.calculateYearlyProjection(700, 2000)).toBe(32400); // (700*12) + (2000*12) = 8400 + 24000 = 32400
    });
  });
});
