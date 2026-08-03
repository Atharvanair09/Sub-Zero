const MerchantNormalizationEngine = require('./MerchantNormalizationEngine');

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
module.exports = IncomeDetectionEngine;