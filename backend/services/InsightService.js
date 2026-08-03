const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');
const FinancialHealthEngine = require('../domain/engines/FinancialHealthEngine');
const CategorizationEngine = require('../domain/engines/CategorizationEngine');
const DateCycleEngine = require('../domain/engines/DateCycleEngine');

const PLAN_ALTERNATIVES = {
  'Netflix': [
    { name: 'Mobile Plan', price: 149, reason: 'You mostly watch on your phone.' },
    { name: 'Basic Plan', price: 199, reason: 'Downgrade from Premium to save ₹300.' }
  ],
  'Spotify': [
    { name: 'Family Plan', price: 179, reason: 'Detected multiple users. Group up to save.' },
    { name: 'Student Discount', price: 59, reason: 'Check if you are eligible for student rates.' }
  ],
  'Adobe': [
    { name: 'Photography Plan', price: 797, reason: 'You only use Photoshop & Lightroom.' },
    { name: 'Canva Pro', price: 499, alternative: true, reason: 'Cheaper alternative for basic design.' }
  ]
};

class InsightService {
  static async getRecommendations(userId) {
    const subs = await subscriptionRepository.findMany({ userId });
    const recommendations = [];

    subs.forEach(sub => {
      const fifteenDaysAgo = DateCycleEngine.getDaysAgo(15);
      const usageScore = FinancialHealthEngine.calculateUsageScore(sub.usageLogs, sub.billingCycle);

      if (!sub.usedRecently || sub.lastUsed < fifteenDaysAgo || usageScore < 0.1) {
        recommendations.push({
          type: 'cancel',
          subscriptionId: sub._id,
          name: sub.name,
          message: `Your usage score is low (${(usageScore * 100).toFixed(1)}%). Consider cancelling ${sub.name} to save ₹${sub.price}/month.`,
          priority: sub.price > 500 ? 'high' : 'medium'
        });
      } 
      
      const alternatives = PLAN_ALTERNATIVES[sub.name] || [];
      alternatives.forEach(alt => {
        if (alt.price < sub.price) {
          recommendations.push({
            type: alt.alternative ? 'alternative' : 'downgrade',
            subscriptionId: sub._id,
            name: sub.name,
            targetPlan: alt.name,
            message: `${alt.reason} Switch to ${alt.name} for ₹${alt.price}.`,
            savings: sub.price - alt.price,
            priority: 'medium'
          });
        }
      });

      const weekendUsage = (sub.usageLogs || []).filter(log => DateCycleEngine.isWeekend(log)).length;
      
      if (weekendUsage > (sub.usageLogs || []).length * 0.8 && sub.plan === 'Premium') {
        recommendations.push({
          type: 'pattern_match',
          subscriptionId: sub._id,
          name: sub.name,
          message: `We detected 80%+ weekend-only usage. A basic plan might be sufficient for your binge habits.`,
          priority: 'low'
        });
      }
    });

    return recommendations;
  }

  static async getPatterns(userId) {
    const txns = await transactionRepository.findMany(userId ? { userId } : {});
    
    let foodTxns = [];
    let shoppingTxns = [];
    let weekendFood = 0;
    let lateNightOrders = 0;
    let totalFoodSpend = 0;

    txns.forEach(t => {
      const isFood = CategorizationEngine.isFood(t.name, t.category);
      const isShopping = CategorizationEngine.isShopping(t.name, t.category);
      
      const date = new Date(t.date || Date.now());

      if (isFood) {
        foodTxns.push(t);
        totalFoodSpend += t.amount || 0;
        if (DateCycleEngine.isWeekend(date)) weekendFood++;
        if (DateCycleEngine.isLateNight(date)) lateNightOrders++;
      }
      if (isShopping) {
        shoppingTxns.push(t);
      }
    });

    const insights = [];

    if (foodTxns.length >= 2) {
      if (weekendFood > foodTxns.length * 0.5) {
        insights.push({ type: 'food', title: 'Weekend Craver', message: 'You order food mostly on weekends. Try meal-prepping on Sundays to save here!' });
      } else {
        const potentialSavings = FinancialHealthEngine.calculatePotentialFoodSavings(totalFoodSpend, foodTxns.length);
        insights.push({ type: 'food', title: 'High Frequency', message: `You order food frequently. Reducing this by 2 orders/wk helps you save ₹${potentialSavings || 800}/mo!` });
      }
    }

    if (lateNightOrders > 0) {
      insights.push({ type: 'behavioral', title: 'Late Night Spikes', message: `Your spending spikes after 10 PM. Try keeping a late-night snack box at home!` });
    }

    if (shoppingTxns.length >= 1) {
      const shopSpend = CategorizationEngine.calculateCategorySpend(shoppingTxns, 'Shopping');
      insights.push({ type: 'shopping', title: 'Impulse Spikes', message: `Shopping impulse detected (₹${Math.round(shopSpend)}). Wait 24h before closing checkout to verify if it's a need.` });
    }

    return insights;
  }
}

module.exports = InsightService;
