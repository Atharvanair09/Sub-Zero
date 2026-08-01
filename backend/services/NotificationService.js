const notificationRepository = require('../repositories/NotificationRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');

class NotificationService {
  static async listNotifications(userId) {
    const subs = await subscriptionRepository.findMany({ userId });
    for (const sub of subs) {
      const daysUntilBilling = Math.ceil((new Date(sub.nextBillingDate) - new Date()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilBilling <= 2 && daysUntilBilling > 0) {
        await notificationRepository.findOneAndUpdate(
          { userId, type: 'renewal', subscriptionId: sub._id, read: false },
          { 
            title: `Renewal in ${daysUntilBilling} days`,
            message: `Your ${sub.name} subscription will renew soon for ₹${sub.price}.`,
            priority: 'high'
          },
          { upsert: true }
        );
      }

      if (sub.usageLogs.length === 0 && (new Date() - new Date(sub.createdAt)) > 15 * 24 * 60 * 60 * 1000) {
        await notificationRepository.findOneAndUpdate(
          { userId, type: 'usage_alert', subscriptionId: sub._id, read: false },
          { 
            title: `Unused for 15 days`,
            message: `You haven't used ${sub.name} since you joined. Should we cancel?`,
            priority: 'medium'
          },
          { upsert: true }
        );
      }

      // Check for price increases
      if (sub.priceHistory && sub.priceHistory.length > 1) {
        const lastPrice = sub.priceHistory[sub.priceHistory.length - 2].price;
        if (sub.price > lastPrice) {
          await notificationRepository.findOneAndUpdate(
            { userId, type: 'price_increase', subscriptionId: sub._id, read: false },
            { 
              title: `Price Increase Detected`,
              message: `The price for ${sub.name} increased from ₹${lastPrice} to ₹${sub.price}.`,
              priority: 'critical'
            },
            { upsert: true }
          );
        }
      }
    }

    return await notificationRepository.findMany({ userId }, { sort: { createdAt: -1 } });
  }

  static async markRead(notificationId) {
    return await notificationRepository.findByIdAndUpdate(notificationId, { read: true });
  }
}

module.exports = NotificationService;
