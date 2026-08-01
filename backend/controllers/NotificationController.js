const notificationService = require('../services/NotificationService');

class NotificationController {
  static async list(req, res) {
    try {
      const notifications = await notificationService.listNotifications(req.query.userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async markRead(req, res) {
    try {
      await notificationService.markRead(req.body.notificationId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = NotificationController;
