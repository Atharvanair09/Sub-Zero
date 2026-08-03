const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const notificationRepository = require('../repositories/NotificationRepository');
const userRepository = require('../repositories/UserRepository');

const FinancialHealthEngine = require('../domain/engines/FinancialHealthEngine');
const CategorizationEngine = require('../domain/engines/CategorizationEngine');
const DateCycleEngine = require('../domain/engines/DateCycleEngine');
const CashFlowEngine = require('../domain/engines/CashFlowEngine');

class DashboardService {
  static async getStats(userId) {
    const user = await userRepository.findById(userId);
    const thirtyDaysAgo = DateCycleEngine.getDaysAgo(30);
    
    const objectUserId = user ? user._id : userId;

    const [txnStatsAgg, txnCategoryAgg, totalTxns, subs] = await Promise.all([
      transactionRepository.aggregate([
        { $match: { userId: objectUserId, date: { $gte: thirtyDaysAgo } } },
        { $group: {
            _id: null,
            txnSpend: { $sum: '$amount' },
            foodSpend: { $sum: { $cond: [{ $eq: ['$category', 'Food'] }, '$amount', 0] } },
            shoppingSpend: { $sum: { $cond: [{ $eq: ['$category', 'Shopping'] }, '$amount', 0] } },
            transportSpend: { $sum: { $cond: [{ $eq: ['$category', 'Transport'] }, '$amount', 0] } }
        }}
      ]),
      transactionRepository.aggregate([
        { $match: { userId: objectUserId, date: { $gte: thirtyDaysAgo } } },
        { $group: { _id: '$category', total: { $sum: '$amount' } } }
      ]),
      transactionRepository.count({ userId: objectUserId, date: { $gte: thirtyDaysAgo } }),
      subscriptionRepository.findMany({ userId: objectUserId })
    ]);

    const txnSpend = txnStatsAgg.length > 0 ? txnStatsAgg[0].txnSpend : 0;
    const foodSpend = txnStatsAgg.length > 0 ? txnStatsAgg[0].foodSpend : 0;
    const shoppingSpend = txnStatsAgg.length > 0 ? txnStatsAgg[0].shoppingSpend : 0;
    const transportSpend = txnStatsAgg.length > 0 ? txnStatsAgg[0].transportSpend : 0;

    const subSpend = CashFlowEngine.calculateMonthlySubscriptionSpend(subs);
    
    const monthlySpend = subSpend + txnSpend;
    const yearlyProjection = CashFlowEngine.calculateYearlyProjection(subSpend, txnSpend);
    
    const subPercent = monthlySpend > 0 ? (subSpend / monthlySpend) * 100 : 0;
    const healthScore = FinancialHealthEngine.calculateTotalHealthScore(subs);

    const categoryData = {};
    txnCategoryAgg.forEach(t => {
      categoryData[t._id] = t.total;
    });
    subs.forEach(s => {
      categoryData[s.category] = (categoryData[s.category] || 0) + s.price;
    });

    const pieChart = Object.keys(categoryData).map(cat => ({
      name: cat,
      value: categoryData[cat]
    }));

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
        logo: 'https://cdn-icons-png.flaticon.com/512/10433/10433048.png'
      }))
    ].sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

    return {
      monthlySpend,
      yearlyProjection,
      pieChart,
      totalSubs: subs.length,
      totalTxns: totalTxns,
      foodSpend,
      shoppingSpend,
      transportSpend,
      subPercent,
      healthScore,
      monthlyBudget: user?.preferences?.monthlyBudget || 0,
      categoryBudgets: user?.preferences?.categoryBudgets || { food: 2000, shopping: 3000, transport: 1000 },
      recentActivity
    };
  }
}

module.exports = DashboardService;
