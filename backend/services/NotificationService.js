const notificationRepository = require('../repositories/NotificationRepository');
const subscriptionRepository = require('../repositories/SubscriptionRepository');
const NotificationDecisionEngine = require('../domain/engines/NotificationDecisionEngine');
const DateCycleEngine = require('../domain/engines/DateCycleEngine');

class NotificationService {
  static async listNotifications(userId) {
    const subs = await subscriptionRepository.findMany({ userId });
    for (const sub of subs) {
      if (NotificationDecisionEngine.shouldSendRenewalAlert(sub.nextBillingDate)) {
        const daysUntilBilling = DateCycleEngine.getDaysUntil(sub.nextBillingDate);
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

      if (NotificationDecisionEngine.shouldSendUsageAlert(sub.usageLogs, sub.createdAt)) {
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

      if (NotificationDecisionEngine.shouldSendPriceIncreaseAlert(sub.price, sub.priceHistory)) {
        const lastPrice = NotificationDecisionEngine.getLastPrice(sub.priceHistory);
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

    return await notificationRepository.findMany({ userId }, { sort: { createdAt: -1 } });
  }

  static async markRead(notificationId) {
    return await notificationRepository.findByIdAndUpdate(notificationId, { read: true });
  }
}

module.exports = NotificationService;
