const cashFlowService = require('../services/CashFlowService');

class CashFlowController {
  static async getSummary(req, res) {
    try {
      const summary = await cashFlowService.getSummary(req.query.userId);
      res.json({ success: true, ...summary });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async processCycle(req, res) {
    try {
      const result = await cashFlowService.processCycle(req.body);
      
      if (result.ignored) {
         return res.json({ success: true, message: result.message });
      }

      res.json({ success: true, cycle: result.cycle });
    } catch (error) {
      if (error.message === "Transaction or Income Source not found") {
         return res.status(404).json({ error: error.message });
      }
      if (error.message === "An income has already been confirmed for this cycle.") {
         return res.status(400).json({ success: false, error: error.message });
      }
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = CashFlowController;
