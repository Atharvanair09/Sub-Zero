const budgetRepository = require('../repositories/BudgetRepository');

class BudgetService {
  static async listBudgets(userId) {
    return await budgetRepository.findMany({ userId });
  }

  static async createBudget({ userId, category, monthlyLimit, thresholds }) {
    // Upsert budget for category
    return await budgetRepository.findOneAndUpdate(
      { userId, category },
      { monthlyLimit, thresholds: thresholds || [80, 100], updatedAt: new Date() },
      { new: true, upsert: true }
    );
  }
}

module.exports = BudgetService;
