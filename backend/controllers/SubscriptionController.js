const subscriptionService = require('../services/SubscriptionService');

class SubscriptionController {
  static async create(req, res) {
    try {
      const result = await subscriptionService.createSubscription(req.body);
      
      if (result.isTransaction) {
         return res.json({ success: true, transaction: result.transaction });
      }

      res.json({ success: true, subscription: result.subscription });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async list(req, res) {
    try {
      const subsWithHealth = await subscriptionService.listSubscriptions(req.query.userId);
      res.json(subsWithHealth);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async logUsage(req, res) {
    const { id, usedRecently } = req.body;
    try {
      const sub = await subscriptionService.logUsage(id, usedRecently);
      res.json({ success: true, updatedSubscription: sub });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async cancel(req, res) {
    try {
      const sub = await subscriptionService.cancelSubscription(req.body.id);
      res.json({ success: true, cancelled: sub });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = SubscriptionController;
