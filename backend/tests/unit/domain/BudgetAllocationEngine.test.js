const BudgetAllocationEngine = require('../../../domain/engines/BudgetAllocationEngine');

describe('BudgetAllocationEngine', () => {
  describe('calculateTotalReservations', () => {
    it('should sum up monthly limits', () => {
      const budgets = [
        { monthlyLimit: 100 },
        { monthlyLimit: 200 },
        { monthlyLimit: null } // Handle null limit
      ];
      expect(BudgetAllocationEngine.calculateTotalReservations(budgets)).toBe(300);
    });

    it('should return 0 for empty array', () => {
      expect(BudgetAllocationEngine.calculateTotalReservations([])).toBe(0);
    });
  });

  describe('calculateBudgetUtilization', () => {
    it('should calculate utilization correctly', () => {
      const budgets = [
        { category: 'Food', monthlyLimit: 500 },
        { category: 'Transport', monthlyLimit: 200 }
      ];
      const txns = [
        { category: 'Food', amount: 250 },
        { category: 'Food', amount: 50 },
        { category: 'Transport', amount: 50 },
        { category: 'Entertainment', amount: 100 } // Not budgeted
      ];

      const utilization = BudgetAllocationEngine.calculateBudgetUtilization(budgets, txns);
      
      expect(utilization).toHaveLength(2);
      expect(utilization[0]).toEqual({
        category: 'Food',
        limit: 500,
        spent: 300,
        percentage: 60
      });
      expect(utilization[1]).toEqual({
        category: 'Transport',
        limit: 200,
        spent: 50,
        percentage: 25
      });
    });

    it('should handle zero limit (avoid division by zero)', () => {
      const budgets = [{ category: 'Food', monthlyLimit: 0 }];
      const txns = [{ category: 'Food', amount: 100 }];
      
      const utilization = BudgetAllocationEngine.calculateBudgetUtilization(budgets, txns);
      
      expect(utilization[0].percentage).toBe(0);
    });
  });
});
