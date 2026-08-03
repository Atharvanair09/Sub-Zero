const TransactionParsingEngine = require('../../../domain/engines/TransactionParsingEngine');

describe('TransactionParsingEngine', () => {
  describe('extractPrice', () => {
    it('should extract price with Rupee symbol', () => {
      expect(TransactionParsingEngine.extractPrice('Amount ₹500 spent')).toBe('500');
    });

    it('should extract price with Dollar symbol', () => {
      expect(TransactionParsingEngine.extractPrice('Paid $12.50 for coffee')).toBe('12.50');
    });

    it('should extract price with Rs text', () => {
      expect(TransactionParsingEngine.extractPrice('Rs 1500 debited')).toBe('1500');
    });

    it('should extract price with INR text', () => {
      expect(TransactionParsingEngine.extractPrice('INR 2500 credited')).toBe('2500');
    });

    it('should extract price with USD text', () => {
      expect(TransactionParsingEngine.extractPrice('USD 100 paid')).toBe('100');
    });

    it('should handle comma as decimal separator', () => {
      expect(TransactionParsingEngine.extractPrice('₹500,50')).toBe('500,50');
    });

    it('should handle no match', () => {
      expect(TransactionParsingEngine.extractPrice('No amount here')).toBe('0');
    });
  });

  describe('detectTypeFallback', () => {
    it('should detect credit for "credited"', () => {
      expect(TransactionParsingEngine.detectTypeFallback('Amount credited to your account')).toBe('credit');
    });

    it('should detect credit for "received"', () => {
      expect(TransactionParsingEngine.detectTypeFallback('You received money')).toBe('credit');
    });

    it('should detect credit for "refunded"', () => {
      expect(TransactionParsingEngine.detectTypeFallback('Amount refunded')).toBe('credit');
    });

    it('should detect debit by default', () => {
      expect(TransactionParsingEngine.detectTypeFallback('Paid for groceries')).toBe('debit');
    });

    it('should handle case insensitivity', () => {
      expect(TransactionParsingEngine.detectTypeFallback('CREDITED Rs 500')).toBe('credit');
    });
  });
});
