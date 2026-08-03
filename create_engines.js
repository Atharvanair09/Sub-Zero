const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'backend', 'domain', 'engines');
fs.mkdirSync(dir, { recursive: true });

const files = {
  'DateCycleEngine.js': `class DateCycleEngine {
  static getDeduplicationWindow(dateStrOrMs) {
    const timestamp = new Date(dateStrOrMs).getTime();
    return {
      windowStart: new Date(timestamp - 2 * 60 * 60 * 1000),
      windowEnd: new Date(timestamp + 2 * 60 * 60 * 1000)
    };
  }

  static getCycleDays(billingCycle) {
    return billingCycle === 'monthly' ? 30 : 365;
  }

  static getDaysAgo(days, fromDate = Date.now()) {
    return new Date(new Date(fromDate).getTime() - days * 24 * 60 * 60 * 1000);
  }

  static getStartOfMonth(fromDate = new Date()) {
    const d = new Date(fromDate);
    return new Date(d.getFullYear(), d.getMonth(), 1);
  }

  static getDaysDifference(date1, date2) {
    return Math.abs(new Date(date1).getTime() - new Date(date2).getTime()) / (1000 * 3600 * 24);
  }

  static getDaysUntil(targetDate, fromDate = new Date()) {
    return Math.ceil((new Date(targetDate).getTime() - new Date(fromDate).getTime()) / (1000 * 60 * 60 * 24));
  }

  static isIncomeTimeMatch(frequency, daysDiff) {
    if (frequency === 'monthly' && daysDiff >= 26 && daysDiff <= 35) return true;
    if (frequency === 'weekly' && daysDiff >= 5 && daysDiff <= 9) return true;
    if (frequency === 'biweekly' && daysDiff >= 12 && daysDiff <= 16) return true;
    return false;
  }

  static getIncomeReferenceDate(lastCycleDate, nextExpectedDate, createdAt, frequency) {
    if (lastCycleDate) return new Date(lastCycleDate);
    if (nextExpectedDate) {
      const referenceDate = new Date(nextExpectedDate);
      if (frequency === 'monthly') referenceDate.setMonth(referenceDate.getMonth() - 1);
      else if (frequency === 'biweekly') referenceDate.setDate(referenceDate.getDate() - 14);
      else if (frequency === 'weekly') referenceDate.setDate(referenceDate.getDate() - 7);
      return referenceDate;
    }
    return new Date(createdAt);
  }

  static isWeekend(date) {
    const day = new Date(date).getDay();
    return day === 0 || day === 6;
  }
  
  static isLateNight(date) {
    const hour = new Date(date).getHours();
    return hour >= 22 || hour <= 4;
  }
  
  static isOver15Days(date1, date2) {
      return (new Date(date1).getTime() - new Date(date2).getTime()) > 15 * 24 * 60 * 60 * 1000;
  }

  static getCycleIdentifier(frequency, dateInput) {
    const date = new Date(dateInput);
    const year = date.getFullYear();
    if (frequency === 'monthly') {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      return \`\${year}-\${month}\`;
    } else if (frequency === 'weekly') {
      const firstDay = new Date(year, 0, 1);
      const pastDaysOfYear = (date - firstDay) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
      return \`\${year}-W\${String(weekNum).padStart(2, '0')}\`;
    } else if (frequency === 'biweekly') {
      const firstDay = new Date(year, 0, 1);
      const pastDaysOfYear = (date - firstDay) / 86400000;
      const weekNum = Math.ceil((pastDaysOfYear + firstDay.getDay() + 1) / 7);
      const biWeekNum = Math.ceil(weekNum / 2);
      return \`\${year}-BW\${String(biWeekNum).padStart(2, '0')}\`;
    } else if (frequency === 'yearly') {
      return \`\${year}\`;
    }
    return \`\${year}-\${String(date.getMonth() + 1).padStart(2, '0')}\`; 
  }
}
module.exports = DateCycleEngine;`,
  'CategorizationEngine.js': `class CategorizationEngine {
  static getTransactionCategory(vendorName, textToScan) {
    const { categorizeTransaction } = require("../../../src/parser/categorizer");
    return categorizeTransaction(vendorName, textToScan);
  }
  
  static isFood(name, category) {
    return ['Food', 'Zomato', 'Swiggy', 'Blinkit', 'Zepto'].includes(category) || 
           /zomato|swiggy|uber eats|blinkit|zepto/i.test(name);
  }
  
  static isShopping(name, category) {
    return ['Shopping', 'Amazon', 'Flipkart'].includes(category) || 
           /amazon|flipkart|myntra/i.test(name);
  }
  
  static isTransport(name, category) {
    return ['Transport', 'Uber', 'Ola', 'Rapido'].includes(category) || 
           /uber|ola|rapido/i.test(name);
  }
  
  static isTransaction(name, category) {
    return ['Food', 'Travel', 'Bank Transaction', 'Shopping'].includes(category) || 
           /zomato|swiggy|uber|ola|blinkit|zepto|amazon (?!prime)/i.test(name);
  }
}
module.exports = CategorizationEngine;`,
  'MerchantNormalizationEngine.js': `class MerchantNormalizationEngine {
  static cleanVendorName(vendorName) {
    return (vendorName || "").toLowerCase().replace(/\\b(upi|hdfc|bank)\\b/gi, '').trim();
  }

  static isGenericName(name) {
    const lower = (name || "").toLowerCase();
    return lower.includes('hdfc') || lower.includes('unknown') || lower.includes('upi');
  }

  static getMostSpecificName(name1, name2) {
    const n1Generic = this.isGenericName(name1);
    const n2Generic = this.isGenericName(name2);
    if (n2Generic && !n1Generic) return name1;
    if (n1Generic && !n2Generic) return name2;
    return name1; 
  }
}
module.exports = MerchantNormalizationEngine;`,
  'TransactionParsingEngine.js': `class TransactionParsingEngine {
  static extractPrice(textToScan) {
    const priceMatch = textToScan.match(/(?:₹|\\$|rs\\.?|usd|inr)\\s?(\\d+(?:[.,]\\d{2})?)/i);
    return priceMatch ? priceMatch[1] : "0";
  }

  static detectTypeFallback(textToScan) {
    if (/\\b(credited|credit|received|refunded|deposited|reversal)\\b/i.test(textToScan)) {
      return 'credit';
    }
    return 'debit';
  }
}
module.exports = TransactionParsingEngine;`,
  'DuplicateDetectionEngine.js': `const MerchantNormalizationEngine = require('./MerchantNormalizationEngine');

class DuplicateDetectionEngine {
  static isSemanticDuplicate(txnName, candidateName, txnType, candidateType, txnAmount, candidateAmount) {
    if (txnType !== candidateType) return false;
    if (parseFloat(txnAmount) !== parseFloat(candidateAmount)) return false;

    const name1 = (txnName || "").toLowerCase();
    const name2 = (candidateName || "").toLowerCase();

    return name1 === name2 || 
           name1.includes(name2) || 
           name2.includes(name1) || 
           MerchantNormalizationEngine.isGenericName(name1) || 
           MerchantNormalizationEngine.isGenericName(name2);
  }
}
module.exports = DuplicateDetectionEngine;`,
  'IncomeDetectionEngine.js': `const MerchantNormalizationEngine = require('./MerchantNormalizationEngine');

class IncomeDetectionEngine {
  static isSourceMatch(vendorName, expectedSender) {
    const cleanExpected = MerchantNormalizationEngine.cleanVendorName(expectedSender);
    const cleanVendor = MerchantNormalizationEngine.cleanVendorName(vendorName);
    return cleanVendor.includes(cleanExpected) || cleanExpected.includes(cleanVendor);
  }

  static isAmountMatch(actualAmount, expectedAmount, tolerance = 100) {
    return Math.abs(expectedAmount - actualAmount) <= tolerance;
  }
}
module.exports = IncomeDetectionEngine;`,
  'IncomeCycleEngine.js': `const DateCycleEngine = require('./DateCycleEngine');

class IncomeCycleEngine {
  static getCycleId(frequency, date) {
    return DateCycleEngine.getCycleIdentifier(frequency, date);
  }
}
module.exports = IncomeCycleEngine;`,
  'BudgetAllocationEngine.js': `class BudgetAllocationEngine {
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
module.exports = BudgetAllocationEngine;`,
  'CashFlowEngine.js': `class CashFlowEngine {
  static calculateRemainingAvailableIncome(totalIncome, totalAllocations, budgetReservations, totalExpenses) {
    return totalIncome - totalAllocations - budgetReservations - totalExpenses;
  }
  
  static calculateTotalExpenses(txns) {
    return txns.reduce((sum, t) => sum + (t.amount || 0), 0);
  }
}
module.exports = CashFlowEngine;`,
  'GoalAllocationEngine.js': `class GoalAllocationEngine {
  static calculateAmountToAdd(allocation, actualAmount) {
    if (allocation.allocationType === 'fixed') {
      return allocation.amountOrPercentage;
    }
    return (actualAmount * allocation.amountOrPercentage) / 100;
  }

  static calculateTotalAllocatedAmount(allocations, incomeSourceAmount) {
    let total = 0;
    for (let alloc of allocations) {
      total += this.calculateAmountToAdd(alloc, incomeSourceAmount);
    }
    return total;
  }

  static validateAllocationLimit(existingAllocations, newAllocation, incomeSourceAmount) {
    const currentTotal = this.calculateTotalAllocatedAmount(existingAllocations, incomeSourceAmount);
    const newAmount = this.calculateAmountToAdd(newAllocation, incomeSourceAmount);
    
    return (currentTotal + newAmount) <= incomeSourceAmount;
  }
}
module.exports = GoalAllocationEngine;`,
  'FinancialHealthEngine.js': `const DateCycleEngine = require('./DateCycleEngine');

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
}
module.exports = FinancialHealthEngine;`,
  'NotificationDecisionEngine.js': `const DateCycleEngine = require('./DateCycleEngine');

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
module.exports = NotificationDecisionEngine;`
};

for (const [filename, content] of Object.entries(files)) {
  fs.writeFileSync(path.join(dir, filename), content);
}
console.log('Created engines');
