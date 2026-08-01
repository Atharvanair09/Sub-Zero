const budgetService = require('../services/BudgetService');

class BudgetController {
  static async list(req, res) {
    try {
      const budgets = await budgetService.listBudgets(req.query.userId);
      res.json(budgets);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const budget = await budgetService.createBudget(req.body);
      res.json({ success: true, budget });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = BudgetController;
