const goalRepository = require('../repositories/GoalRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const incomeRepository = require('../repositories/IncomeRepository');

class GoalService {
  static async listGoals(userId) {
    return await goalRepository.findMany({ userId });
  }

  static async createGoal(data) {
    return await goalRepository.create(data);
  }

  static async listAllocations(userId) {
    return await goalAllocationRepository.findMany({ userId }, { populate: 'goalId' });
  }

  static async createAllocation(data) {
    const { userId, incomeSourceId, goalId, allocationType, amountOrPercentage } = data;
    
    const incomeSource = await incomeRepository.findById(incomeSourceId);
    if (!incomeSource) {
      throw new Error("Income source not found");
    }

    // Validate allocation limit
    const existingAllocations = await goalAllocationRepository.findMany({ incomeSourceId, status: 'active' });
    
    let totalAllocatedAmount = 0;
    for (let alloc of existingAllocations) {
      if (alloc.allocationType === 'fixed') {
        totalAllocatedAmount += alloc.amountOrPercentage;
      } else {
        totalAllocatedAmount += (incomeSource.amount * alloc.amountOrPercentage) / 100;
      }
    }

    let newAllocAmount = 0;
    if (allocationType === 'fixed') {
      newAllocAmount = amountOrPercentage;
    } else {
      newAllocAmount = (incomeSource.amount * amountOrPercentage) / 100;
    }

    if (totalAllocatedAmount + newAllocAmount > incomeSource.amount) {
      const error = new Error("Allocation exceeds total income amount. Please reduce your allocation.");
      error.isValidationError = true;
      throw error;
    }

    return await goalAllocationRepository.create(data);
  }
}

module.exports = GoalService;
