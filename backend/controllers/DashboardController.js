const dashboardService = require('../services/DashboardService');

class DashboardController {
  static async getStats(req, res) {
    try {
      const stats = await dashboardService.getStats(req.query.userId);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = DashboardController;
