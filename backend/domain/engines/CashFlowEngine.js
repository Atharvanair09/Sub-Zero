class CashFlowEngine {
  static calculateRemainingAvailableIncome(totalIncome, totalAllocations, budgetReservations, totalExpenses) {
    return totalIncome - totalAllocations - budgetReservations - totalExpenses;
  }
  
  static calculateTotalExpenses(txns) {
    return txns.reduce((sum, t) => sum + (t.amount || 0), 0);
  }
  
  static calculateMonthlySubscriptionSpend(subscriptions) {
    return subscriptions.reduce((sum, s) => sum + (s.billingCycle === 'monthly' ? s.price : s.price / 12), 0);
  }

  static calculateYearlyProjection(monthlySubSpend, monthlyTxnSpend) {
    return (monthlySubSpend * 12) + (monthlyTxnSpend * 12);
  }
}
module.exports = CashFlowEngine;