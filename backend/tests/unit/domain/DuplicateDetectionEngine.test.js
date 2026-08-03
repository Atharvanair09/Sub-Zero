const DuplicateDetectionEngine = require('../../../domain/engines/DuplicateDetectionEngine');

describe('DuplicateDetectionEngine', () => {
  describe('isSemanticDuplicate', () => {
    it('should return false if types differ', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix', 'Netflix', 'debit', 'credit', '15.00', '15.00')).toBe(false);
    });

    it('should return false if amounts differ', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix', 'Netflix', 'debit', 'debit', '15.00', '20.00')).toBe(false);
    });

    it('should return true for exact match', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix', 'Netflix', 'debit', 'debit', '15.00', '15.00')).toBe(true);
    });

    it('should return true if name1 includes name2', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix Inc', 'Netflix', 'debit', 'debit', '15.00', '15.00')).toBe(true);
    });

    it('should return true if name2 includes name1', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix', 'Netflix Inc', 'debit', 'debit', '15.00', '15.00')).toBe(true);
    });

    it('should return true if one name is generic (HDFC)', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('HDFC Bank', 'Netflix', 'debit', 'debit', '15.00', '15.00')).toBe(true);
    });

    it('should return true if one name is generic (UPI)', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate('Netflix', 'UPI Payment', 'debit', 'debit', '15.00', '15.00')).toBe(true);
    });

    it('should handle null or undefined names gracefully', () => {
      expect(DuplicateDetectionEngine.isSemanticDuplicate(null, 'Netflix', 'debit', 'debit', '15.00', '15.00')).toBe(false);
    });
  });
});
