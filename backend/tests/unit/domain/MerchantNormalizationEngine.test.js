const MerchantNormalizationEngine = require('../../../domain/engines/MerchantNormalizationEngine');

describe('MerchantNormalizationEngine', () => {
  describe('cleanVendorName', () => {
    it('should remove common bank keywords and trim whitespace', () => {
      expect(MerchantNormalizationEngine.cleanVendorName('  HDFC Bank Netflix UPI  ')).toBe('Netflix');
    });

    it('should handle null or undefined gracefully', () => {
      expect(MerchantNormalizationEngine.cleanVendorName(null)).toBe('');
      expect(MerchantNormalizationEngine.cleanVendorName(undefined)).toBe('');
    });

    it('should convert to lowercase', () => {
      expect(MerchantNormalizationEngine.cleanVendorName('AMAZON')).toBe('amazon');
    });
  });

  describe('isGenericName', () => {
    it('should return true for generic names', () => {
      expect(MerchantNormalizationEngine.isGenericName('HDFC')).toBe(true);
      expect(MerchantNormalizationEngine.isGenericName('UPI Transaction')).toBe(true);
      expect(MerchantNormalizationEngine.isGenericName('unknown merchant')).toBe(true);
    });

    it('should return false for specific names', () => {
      expect(MerchantNormalizationEngine.isGenericName('Netflix')).toBe(false);
      expect(MerchantNormalizationEngine.isGenericName('Amazon Prime')).toBe(false);
    });

    it('should handle null or undefined gracefully', () => {
      expect(MerchantNormalizationEngine.isGenericName(null)).toBe(false);
    });
  });

  describe('getMostSpecificName', () => {
    it('should return name1 if name2 is generic', () => {
      expect(MerchantNormalizationEngine.getMostSpecificName('Netflix', 'HDFC Bank')).toBe('Netflix');
    });

    it('should return name2 if name1 is generic', () => {
      expect(MerchantNormalizationEngine.getMostSpecificName('UPI', 'Amazon')).toBe('Amazon');
    });

    it('should return name1 if both are specific', () => {
      expect(MerchantNormalizationEngine.getMostSpecificName('Netflix', 'Amazon')).toBe('Netflix');
    });

    it('should return name1 if both are generic', () => {
      expect(MerchantNormalizationEngine.getMostSpecificName('HDFC', 'UPI')).toBe('HDFC');
    });
  });
});
