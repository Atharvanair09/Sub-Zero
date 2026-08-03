const IncomeDetectionEngine = require('../../../domain/engines/IncomeDetectionEngine');

describe('IncomeDetectionEngine', () => {
  describe('isSourceMatch', () => {
    it('should return true for exact match after cleaning', () => {
      expect(IncomeDetectionEngine.isSourceMatch('Google Salary', 'Google')).toBe(true);
    });

    it('should return true if vendor includes expected', () => {
      expect(IncomeDetectionEngine.isSourceMatch('Employer XYZ Corp', 'XYZ')).toBe(true);
    });

    it('should return true if expected includes vendor', () => {
      expect(IncomeDetectionEngine.isSourceMatch('XYZ', 'Employer XYZ Corp')).toBe(true);
    });

    it('should return false if no match', () => {
      expect(IncomeDetectionEngine.isSourceMatch('Amazon', 'Google')).toBe(false);
    });
  });

  describe('isAmountMatch', () => {
    it('should return true if amounts match exactly', () => {
      expect(IncomeDetectionEngine.isAmountMatch(5000, 5000)).toBe(true);
    });

    it('should return true if amounts are within default tolerance', () => {
      expect(IncomeDetectionEngine.isAmountMatch(4950, 5000)).toBe(true); // Within 100
    });

    it('should return false if amounts are outside default tolerance', () => {
      expect(IncomeDetectionEngine.isAmountMatch(4800, 5000)).toBe(false); // Outside 100
    });

    it('should respect custom tolerance', () => {
      expect(IncomeDetectionEngine.isAmountMatch(4800, 5000, 200)).toBe(true);
      expect(IncomeDetectionEngine.isAmountMatch(4700, 5000, 200)).toBe(false);
    });
  });
});
