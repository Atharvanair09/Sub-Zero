const CategorizationEngine = require('../../../domain/engines/CategorizationEngine');

jest.mock('../../../src/parser/categorizer', () => ({
  categorizeTransaction: jest.fn((vendor, text) => {
    if (vendor === 'Netflix') return 'Entertainment';
    return 'Other';
  })
}));

describe('CategorizationEngine', () => {
  describe('getTransactionCategory', () => {
    it('should call internal categorizer', () => {
      expect(CategorizationEngine.getTransactionCategory('Netflix', 'desc')).toBe('Entertainment');
      expect(CategorizationEngine.getTransactionCategory('Unknown', 'desc')).toBe('Other');
    });
  });

  describe('isFood', () => {
    it('should return true for food keywords/categories', () => {
      expect(CategorizationEngine.isFood('Zomato Delivery', 'Other')).toBe(true);
      expect(CategorizationEngine.isFood('Local Cafe', 'Food')).toBe(true);
    });
    
    it('should return false for non-food', () => {
      expect(CategorizationEngine.isFood('Amazon', 'Shopping')).toBe(false);
    });
  });

  describe('isShopping', () => {
    it('should return true for shopping keywords/categories', () => {
      expect(CategorizationEngine.isShopping('Amazon Order', 'Other')).toBe(true);
      expect(CategorizationEngine.isShopping('Store', 'Shopping')).toBe(true);
    });
  });

  describe('isTransport', () => {
    it('should return true for transport keywords/categories', () => {
      expect(CategorizationEngine.isTransport('Uber Ride', 'Other')).toBe(true);
      expect(CategorizationEngine.isTransport('Taxi', 'Transport')).toBe(true);
    });
  });

  describe('isTransaction', () => {
    it('should return true for transaction categories', () => {
      expect(CategorizationEngine.isTransaction('Random', 'Bank Transaction')).toBe(true);
      expect(CategorizationEngine.isTransaction('Zomato', 'Other')).toBe(true);
    });
  });

  describe('calculateCategorySpend', () => {
    it('should sum amounts for a specific category', () => {
      const txns = [
        { name: 'Zomato', amount: 300, category: 'Other' },
        { name: 'Uber', amount: 200, category: 'Other' },
        { name: 'Swiggy', amount: 150, category: 'Food' }
      ];
      
      expect(CategorizationEngine.calculateCategorySpend(txns, 'Food')).toBe(450);
      expect(CategorizationEngine.calculateCategorySpend(txns, 'Transport')).toBe(200);
      expect(CategorizationEngine.calculateCategorySpend(txns, 'Shopping')).toBe(0);
    });
  });

  describe('calculateCategoryBreakdown', () => {
    it('should calculate breakdown from subs and txns', () => {
      const subs = [
        { category: 'Entertainment', price: 500 },
        { category: 'Utilities', price: 1000 }
      ];
      const txns = [
        { name: 'Zomato', category: 'Other', amount: 300 }, // Becomes 'Food'
        { name: 'Amazon', category: 'Shopping', amount: 400 },
        { name: 'Unknown', amount: 100 } // Becomes 'Transaction'
      ];
      
      const breakdown = CategorizationEngine.calculateCategoryBreakdown(subs, txns);
      
      expect(breakdown).toEqual({
        'Entertainment': 500,
        'Utilities': 1000,
        'Food': 300,
        'Shopping': 400,
        'Transaction': 100
      });
    });
  });
});
