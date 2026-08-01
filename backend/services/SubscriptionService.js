const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');

class SubscriptionService {
  static async createSubscription(data) {
    const { userId, name, price, plan, logo, color, category, billingCycle, nextBillingDate, externalId, type } = data;
    
    const isTransaction = ['Food', 'Travel', 'Bank Transaction', 'Shopping'].includes(category) || 
                          /zomato|swiggy|uber|ola|blinkit|zepto|amazon (?!prime)/i.test(name);
    const parsedPrice = parseFloat(price);

    if (isTransaction) {
       const newTxn = await transactionRepository.create({
         userId,
         name,
         amount: parsedPrice,
         category: category || 'Bank Transaction',
         logo: logo || `https://www.google.com/s2/favicons?sz=128&domain=${name.toLowerCase().replace(/\s/g, '')}.com`,
         externalId,
         type: type || 'debit'
       });
       return { isTransaction: true, transaction: newTxn };
    }

    const newSub = await subscriptionRepository.create({
      userId,
      name,
      price: parsedPrice,
      plan: plan || 'BASIC',
      logo: logo || 'https://www.cdnlogo.com/logos/z/19/zapier.svg',
      nextBillingDate: nextBillingDate ? new Date(nextBillingDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      status: 'active',
      color: color || '#6366f1',
      category: category || 'General',
      billingCycle: billingCycle || 'monthly',
      externalId // Save the reference to prevent duplicates
    });
    return { isTransaction: false, subscription: newSub };
  }

  static async listSubscriptions(userId) {
    const subscriptions = await subscriptionRepository.findMany(userId ? { userId } : {});
    return subscriptions.map(s => {
        const cycleDays = s.billingCycle === 'monthly' ? 30 : 365;
        const uniqueDaysUsed = new Set(s.usageLogs.map(log => new Date(log).toISOString().split('T')[0])).size;
        let itemScore = (uniqueDaysUsed / cycleDays) * 100;
        if (!s.usedRecently) itemScore -= 30;
        if (s.price < 500 && uniqueDaysUsed > 5) itemScore += 20;
        itemScore = Math.min(Math.max(0, itemScore), 100);
        if(uniqueDaysUsed === 0 && s.usedRecently) itemScore = 85; 

        return {
          ...s.toObject(),
          healthScore: Math.round(itemScore)
        };
    });
  }

  static async logUsage(id, usedRecently) {
    const update = { usedRecently, lastUsed: new Date() };
    if (usedRecently) {
      update.$push = { usageLogs: new Date() };
    }
    return await subscriptionRepository.findByIdAndUpdate(id, update, { new: true });
  }

  static async cancelSubscription(id) {
    return await subscriptionRepository.findByIdAndDelete(id);
  }
}

module.exports = SubscriptionService;
