class CategorizationEngine {
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

  static calculateCategorySpend(txns, categoryName) {
    return txns.filter(t => {
       if (categoryName === 'Food') return this.isFood(t.name, t.category);
       if (categoryName === 'Shopping') return this.isShopping(t.name, t.category);
       if (categoryName === 'Transport') return this.isTransport(t.name, t.category);
       return false;
    }).reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  static calculateCategoryBreakdown(subscriptions, transactions) {
    const categoryData = subscriptions.reduce((acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + s.price;
      return acc;
    }, {});

    transactions.forEach(t => {
      let cat = t.category || 'Transaction';
      if(this.isFood(t.name, t.category)) cat = "Food";
      categoryData[cat] = (categoryData[cat] || 0) + t.amount;
    });
    return categoryData;
  }
}
module.exports = CategorizationEngine;