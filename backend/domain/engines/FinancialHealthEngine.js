const DateCycleEngine = require('./DateCycleEngine');

class FinancialHealthEngine {
  static calculateItemHealthScore(usageLogs, billingCycle, usedRecently, price) {
    const cycleDays = DateCycleEngine.getCycleDays(billingCycle);
    const uniqueDays = new Set((usageLogs || []).map(log => new Date(log).toISOString().split('T')[0])).size;
    
    let itemScore = (uniqueDays / cycleDays) * 100;
    
    if (!usedRecently) itemScore -= 30; 
    if (price < 500 && uniqueDays > 5) itemScore += 20; 
    
    itemScore = Math.min(Math.max(0, itemScore), 100);
    if(uniqueDays === 0 && usedRecently) itemScore = 85; 
    
    return Math.round(itemScore);
  }
  
  static calculateTotalHealthScore(subscriptions) {
    if (!subscriptions || subscriptions.length === 0) return 100;
    
    let totalScore = 0;
    for (let s of subscriptions) {
      totalScore += this.calculateItemHealthScore(s.usageLogs, s.billingCycle, s.usedRecently, s.price);
    }
    return Math.round(totalScore / subscriptions.length);
  }
  
  static calculateUsageScore(usageLogs, billingCycle, todayDate = Date.now()) {
    const cycleDays = DateCycleEngine.getCycleDays(billingCycle);
    const recentLogs = (usageLogs || []).filter(log => 
       new Date(log) > DateCycleEngine.getDaysAgo(cycleDays, todayDate)
    );
    const uniqueDays = new Set(recentLogs.map(log => new Date(log).toISOString().split('T')[0])).size;
    return uniqueDays / cycleDays;
  }
  
  static calculatePotentialFoodSavings(totalFoodSpend, foodTxnsCount) {
    return Math.round((totalFoodSpend / foodTxnsCount) * 2 * 4);
  }
  
  static calculateUnusedSubscriptionSavings(unusedSubscriptions) {
    return unusedSubscriptions.reduce((sum, s) => sum + s.price, 0);
  }
}
module.exports = FinancialHealthEngine;