const GoalAllocationEngine = require('../../../domain/engines/GoalAllocationEngine');

describe('GoalAllocationEngine', () => {
  describe('calculateAmountToAdd', () => {
    it('should calculate correct amount for fixed allocation', () => {
      const allocation = { allocationType: 'fixed', amountOrPercentage: 500 };
      expect(GoalAllocationEngine.calculateAmountToAdd(allocation, 5000)).toBe(500);
    });

    it('should calculate correct amount for percentage allocation', () => {
      const allocation = { allocationType: 'percentage', amountOrPercentage: 10 };
      expect(GoalAllocationEngine.calculateAmountToAdd(allocation, 5000)).toBe(500);
    });
  });

  describe('calculateTotalAllocatedAmount', () => {
    it('should calculate total allocated amount from multiple allocations', () => {
      const allocations = [
        { allocationType: 'fixed', amountOrPercentage: 500 },
        { allocationType: 'percentage', amountOrPercentage: 10 }
      ];
      expect(GoalAllocationEngine.calculateTotalAllocatedAmount(allocations, 5000)).toBe(1000);
    });

    it('should return 0 for empty allocations', () => {
      expect(GoalAllocationEngine.calculateTotalAllocatedAmount([], 5000)).toBe(0);
    });
  });

  describe('validateAllocationLimit', () => {
    it('should return true if new allocation fits within limit', () => {
      const existingAllocations = [
        { allocationType: 'fixed', amountOrPercentage: 1000 }
      ];
      const newAllocation = { allocationType: 'fixed', amountOrPercentage: 500 };
      expect(GoalAllocationEngine.validateAllocationLimit(existingAllocations, newAllocation, 2000)).toBe(true);
    });

    it('should return false if new allocation exceeds limit', () => {
      const existingAllocations = [
        { allocationType: 'fixed', amountOrPercentage: 1500 }
      ];
      const newAllocation = { allocationType: 'fixed', amountOrPercentage: 600 };
      expect(GoalAllocationEngine.validateAllocationLimit(existingAllocations, newAllocation, 2000)).toBe(false);
    });
  });
});
