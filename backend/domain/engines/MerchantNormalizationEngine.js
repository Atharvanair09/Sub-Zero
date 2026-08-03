class MerchantNormalizationEngine {
  static cleanVendorName(vendorName) {
    return (vendorName || "").toLowerCase().replace(/\b(upi|hdfc|bank)\b/gi, '').trim();
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
module.exports = MerchantNormalizationEngine;