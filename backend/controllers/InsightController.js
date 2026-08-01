const subscriptionRepository = require('../repositories/SubscriptionRepository');
const transactionRepository = require('../repositories/TransactionRepository');

// Plan Alternatives Database (Phase 2: Plan Optimization)
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

class InsightController {
  static async getRecommendations(req, res) {
    const { userId } = req.query;
    try {
      const subs = await subscriptionRepository.findMany({ userId });
      const recommendations = [];

      subs.forEach(sub => {
        const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
        
        // Calculate usage score: days_used / billing_cycle_days
        const cycleDays = sub.billingCycle === 'monthly' ? 30 : 365;
        
        // Get unique days used in the last cycle
        const uniqueDaysUsed = new Set(
          sub.usageLogs
            .filter(log => log > new Date(Date.now() - cycleDays * 24 * 60 * 60 * 1000))
            .map(log => log.toISOString().split('T')[0])
        ).size;
        
        const usageScore = uniqueDaysUsed / cycleDays;

        // Rule 1: Low Usage (Cancel)
        if (!sub.usedRecently || sub.lastUsed < fifteenDaysAgo || usageScore < 0.1) {
          recommendations.push({
            type: 'cancel',
            subscriptionId: sub._id,
            name: sub.name,
            message: `Your usage score is low (${(usageScore * 100).toFixed(1)}%). Consider cancelling ${sub.name} to save ₹${sub.price}/month.`,
            priority: sub.price > 500 ? 'high' : 'medium'
          });
        } 
        
        // Rule 2: Plan Optimization (Downgrade/Alternative)
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

        // Rule 3: Heavy usage on Weekend/Binge (Personalized Suggestion)
        const weekendUsage = sub.usageLogs.filter(log => {
          const day = new Date(log).getDay();
          return day === 0 || day === 6;
        }).length;
        
        if (weekendUsage > sub.usageLogs.length * 0.8 && sub.plan === 'Premium') {
          recommendations.push({
            type: 'pattern_match',
            subscriptionId: sub._id,
            name: sub.name,
            message: `We detected 80%+ weekend-only usage. A basic plan might be sufficient for your binge habits.`,
            priority: 'low'
          });
        }
      });

      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async getPatterns(req, res) {
    const { userId } = req.query;
    try {
      const txns = await transactionRepository.findMany(userId ? { userId } : {});
      
      let foodTxns = [];
      let shoppingTxns = [];
      let weekendFood = 0;
      let lateNightOrders = 0;
      let totalFoodSpend = 0;

      txns.forEach(t => {
        const isFood = ['Food', 'Zomato', 'Swiggy', 'Blinkit', 'Zepto'].includes(t.category) || /zomato|swiggy|uber eats/i.test(t.name);
        const isShopping = ['Shopping', 'Amazon', 'Flipkart'].includes(t.category) || /amazon|flipkart|myntra/i.test(t.name);
        
        const date = new Date(t.date || Date.now());
        const day = date.getDay();
        const hour = date.getHours();

        if (isFood) {
          foodTxns.push(t);
          totalFoodSpend += t.amount || 0;
          if (day === 0 || day === 6) weekendFood++;
          if (hour >= 22 || hour <= 4) lateNightOrders++;
        }
        if (isShopping) {
          shoppingTxns.push(t);
        }
      });

      const insights = [];

      // Food behaviors
      if (foodTxns.length >= 2) {
        if (weekendFood > foodTxns.length * 0.5) {
          insights.push({ type: 'food', title: 'Weekend Craver', message: 'You order food mostly on weekends. Try meal-prepping on Sundays to save here!' });
        } else {
          const potentialSavings = Math.round((totalFoodSpend / foodTxns.length) * 2 * 4); // saving 2 orders a week
          insights.push({ type: 'food', title: 'High Frequency', message: `You order food frequently. Reducing this by 2 orders/wk helps you save ₹${potentialSavings || 800}/mo!` });
        }
      }

      // Late night
      if (lateNightOrders > 0) {
        insights.push({ type: 'behavioral', title: 'Late Night Spikes', message: `Your spending spikes after 10 PM. Try keeping a late-night snack box at home!` });
      }

      // Shopping
      if (shoppingTxns.length >= 1) {
        const shopSpend = shoppingTxns.reduce((sum, t) => sum + (t.amount || 0), 0);
        insights.push({ type: 'shopping', title: 'Impulse Spikes', message: `Shopping impulse detected (₹${Math.round(shopSpend)}). Wait 24h before closing checkout to verify if it's a need.` });
      }

      res.json({ success: true, insights });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

module.exports = InsightController;
