const goalService = require('../services/GoalService');

class GoalController {
  static async list(req, res) {
    try {
      const goals = await goalService.listGoals(req.query.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async create(req, res) {
    try {
      const goal = await goalService.createGoal(req.body);
      res.json({ success: true, goal });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async listAllocations(req, res) {
    try {
      const allocations = await goalService.listAllocations(req.query.userId);
      res.json(allocations);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async createAllocation(req, res) {
    try {
      const allocation = await goalService.createAllocation(req.body);
      res.json({ success: true, allocation });
    } catch (error) {
      if (error.message === "Income source not found") {
         return res.status(404).json({ error: error.message });
      }
      if (error.isValidationError) {
         return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = GoalController;
