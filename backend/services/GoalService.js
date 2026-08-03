const goalRepository = require('../repositories/GoalRepository');
const goalAllocationRepository = require('../repositories/GoalAllocationRepository');
const incomeRepository = require('../repositories/IncomeRepository');
const GoalAllocationEngine = require('../domain/engines/GoalAllocationEngine');

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

    const existingAllocations = await goalAllocationRepository.findMany({ incomeSourceId, status: 'active' });
    
    const isValid = GoalAllocationEngine.validateAllocationLimit(existingAllocations, { allocationType, amountOrPercentage }, incomeSource.amount);

    if (!isValid) {
      const error = new Error("Allocation exceeds total income amount. Please reduce your allocation.");
      error.isValidationError = true;
      throw error;
    }

    return await goalAllocationRepository.create(data);
  }
}

module.exports = GoalService;
