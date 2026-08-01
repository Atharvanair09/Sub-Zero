const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const notificationRepository = require('../repositories/NotificationRepository');
const userRepository = require('../repositories/UserRepository');

class DashboardController {
  static async getStats(req, res) {
    const { userId } = req.query;
    try {
      const subs = await subscriptionRepository.findMany({ userId });
      const user = await userRepository.findById(userId);
      
      // Get recent transactions to accurately calculate monthly spend
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const txns = await transactionRepository.findMany({ userId, date: { $gte: thirtyDaysAgo } });
      
      const subSpend = subs.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0);
      const txnSpend = txns.reduce((sum, t) => sum + (t.amount || 0), 0);
      
      const monthlySpend = subSpend + txnSpend;
      const yearlyProjection = (subSpend * 12) + (txnSpend * 12);
      
      // Financial Intelligence
      const foodSpend = txns.filter(t => ['Food', 'Zomato', 'Swiggy', 'Blinkit', 'Zepto'].includes(t.category) || /zomato|swiggy|uber eats|blinkit|zepto/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
      const shoppingSpend = txns.filter(t => ['Shopping', 'Amazon', 'Flipkart'].includes(t.category) || /amazon|flipkart|myntra/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
      const transportSpend = txns.filter(t => ['Transport', 'Uber', 'Ola', 'Rapido'].includes(t.category) || /uber|ola|rapido/i.test(t.name)).reduce((sum, t) => sum + (t.amount || 0), 0);
      const subPercent = monthlySpend > 0 ? (subSpend / monthlySpend) * 100 : 0;
      
      let healthScore = 0;
      if(subs.length > 0) {
        let totalScore = 0;
        subs.forEach(s => {
          const cycleDays = s.billingCycle === 'monthly' ? 30 : 365;
          const uniqueDaysUsed = new Set(s.usageLogs.map(log => new Date(log).toISOString().split('T')[0])).size;
          let itemScore = (uniqueDaysUsed / cycleDays) * 100;
          if (!s.usedRecently) itemScore -= 30; // penalty
          if (s.price < 500 && uniqueDaysUsed > 5) itemScore += 20;
          itemScore = Math.min(Math.max(0, itemScore), 100);
          if(uniqueDaysUsed === 0 && s.usedRecently) itemScore = 85;
          totalScore += itemScore;
        });
        healthScore = Math.round(totalScore / subs.length);
      } else {
        healthScore = 100;
      }

      const categoryData = subs.reduce((acc, s) => {
        acc[s.category] = (acc[s.category] || 0) + s.price;
        return acc;
      }, {});

      // Add transaction categories
      txns.forEach(t => {
        let cat = t.category || 'Transaction';
        if(/zomato|swiggy|uber eats/i.test(t.name)) cat = "Food";
        categoryData[cat] = (categoryData[cat] || 0) + t.amount;
      });

      const pieChart = Object.keys(categoryData).map(cat => ({
        name: cat,
        value: categoryData[cat]
      }));

      // Dynamic Recent Activity (Syncing notifications + transactions)
      const recentTxns = await transactionRepository.findMany({ userId }, { sort: { date: -1 }, limit: 5 });
      const recentNotifs = await notificationRepository.findMany({ userId }, { sort: { createdAt: -1 }, limit: 3 });
      
      const recentActivity = [
        ...recentTxns.map(t => ({
          id: t._id,
          type: 'transaction',
          name: t.name,
          price: t.amount,
          message: 'Payment confirmed',
          date: t.date || t.createdAt,
          category: t.category,
          logo: t.logo
        })),
        ...recentNotifs.map(n => ({
          id: n._id,
          type: 'notification',
          name: n.title,
          price: n.priority === 'high' ? 'ALERT' : 'AI INFO',
          message: n.message,
          date: n.createdAt,
          subType: n.type,
          logo: 'https://cdn-icons-png.flaticon.com/512/10433/10433048.png' // Default AI logo
        }))
      ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

      res.json({
        monthlySpend,
        yearlyProjection,
        pieChart,
        totalSubs: subs.length,
        totalTxns: txns.length,
        foodSpend,
        shoppingSpend,
        transportSpend,
        subPercent,
        healthScore,
        monthlyBudget: user?.preferences?.monthlyBudget || 0,
        categoryBudgets: user?.preferences?.categoryBudgets || { food: 2000, shopping: 3000, transport: 1000 },
        recentActivity
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}

module.exports = DashboardController;
