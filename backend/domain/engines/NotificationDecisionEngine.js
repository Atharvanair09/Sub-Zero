const DateCycleEngine = require('./DateCycleEngine');

class NotificationDecisionEngine {
  static shouldSendRenewalAlert(nextBillingDate, todayDate = new Date()) {
    const daysUntilBilling = DateCycleEngine.getDaysUntil(nextBillingDate, todayDate);
    return daysUntilBilling <= 2 && daysUntilBilling > 0;
  }

  static shouldSendUsageAlert(usageLogs, createdAt, todayDate = new Date()) {
    return (!usageLogs || usageLogs.length === 0) && DateCycleEngine.isOver15Days(todayDate, createdAt);
  }

  static shouldSendPriceIncreaseAlert(currentPrice, priceHistory) {
    if (!priceHistory || priceHistory.length < 2) return false;
    const lastPrice = priceHistory[priceHistory.length - 2].price;
    return currentPrice > lastPrice;
  }
  
  static getLastPrice(priceHistory) {
     if (!priceHistory || priceHistory.length < 2) return 0;
     return priceHistory[priceHistory.length - 2].price;
  }
}
module.exports = NotificationDecisionEngine;