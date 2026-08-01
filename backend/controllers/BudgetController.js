const budgetRepository = require('../repositories/BudgetRepository');

class BudgetController {
  static async list(req, res) {
    try {
      const budgets = await budgetRepository.findMany({ userId: req.query.userId });
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      // Upsert budget for category
      const { userId, category, monthlyLimit, thresholds } = req.body;
      const budget = await budgetRepository.findOneAndUpdate(
        { userId, category },
        { monthlyLimit, thresholds: thresholds || [80, 100], updatedAt: new Date() },
        { new: true, upsert: true }
      );
      res.json({ success: true, budget });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = BudgetController;
