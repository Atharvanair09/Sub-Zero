class GoalAllocationEngine {
  static calculateAmountToAdd(allocation, actualAmount) {
    if (allocation.allocationType === 'fixed') {
      return allocation.amountOrPercentage;
    }
    return (actualAmount * allocation.amountOrPercentage) / 100;
  }

  static calculateTotalAllocatedAmount(allocations, incomeSourceAmount) {
    let total = 0;
    for (let alloc of allocations) {
      total += this.calculateAmountToAdd(alloc, incomeSourceAmount);
    }
    return total;
  }

  static validateAllocationLimit(existingAllocations, newAllocation, incomeSourceAmount) {
    const currentTotal = this.calculateTotalAllocatedAmount(existingAllocations, incomeSourceAmount);
    const newAmount = this.calculateAmountToAdd(newAllocation, incomeSourceAmount);
    
    return (currentTotal + newAmount) <= incomeSourceAmount;
  }
}
module.exports = GoalAllocationEngine;