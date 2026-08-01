const insightService = require('../services/InsightService');

class InsightController {
  static async getRecommendations(req, res) {
    try {
      const recommendations = await insightService.getRecommendations(req.query.userId);
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPatterns(req, res) {
    try {
      const insights = await insightService.getPatterns(req.query.userId);
      res.json({ success: true, insights });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = InsightController;
