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
    const subs = await subscriptionRepository.findMany({ userId });
    const user = await userRepository.findById(userId);
    
    const thirtyDaysAgo = DateCycleEngine.getDaysAgo(30);
    const txns = await transactionRepository.findMany({ userId, date: { $gte: thirtyDaysAgo } });
    
    const subSpend = CashFlowEngine.calculateMonthlySubscriptionSpend(subs);
    const txnSpend = CashFlowEngine.calculateTotalExpenses(txns);
    
    const monthlySpend = subSpend + txnSpend;
    const yearlyProjection = CashFlowEngine.calculateYearlyProjection(subSpend, txnSpend);
    
    const foodSpend = CategorizationEngine.calculateCategorySpend(txns, 'Food');
    const shoppingSpend = CategorizationEngine.calculateCategorySpend(txns, 'Shopping');
    const transportSpend = CategorizationEngine.calculateCategorySpend(txns, 'Transport');
    const subPercent = monthlySpend > 0 ? (subSpend / monthlySpend) * 100 : 0;
    
    const healthScore = FinancialHealthEngine.calculateTotalHealthScore(subs);

    const categoryData = CategorizationEngine.calculateCategoryBreakdown(subs, txns);

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
      totalTxns: txns.length,
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
