class BudgetAllocationEngine {
  static calculateTotalReservations(budgets) {
    return budgets.reduce((sum, b) => sum + (b.monthlyLimit || 0), 0);
  }
  
  static calculateBudgetUtilization(budgets, txns) {
    const utilization = [];
    for (let b of budgets) {
      const spent = txns.filter(t => t.category === b.category).reduce((s, t) => s + (t.amount || 0), 0);
      utilization.push({
        category: b.category,
        limit: b.monthlyLimit,
        spent: spent,
        percentage: b.monthlyLimit ? (spent / b.monthlyLimit) * 100 : 0
      });
    }
    return utilization;
  }
}
module.exports = BudgetAllocationEngine;