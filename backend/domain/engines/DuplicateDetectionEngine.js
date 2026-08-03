const MerchantNormalizationEngine = require('./MerchantNormalizationEngine');

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
module.exports = DuplicateDetectionEngine;