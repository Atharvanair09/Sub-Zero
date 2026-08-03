class TransactionParsingEngine {
  static extractPrice(textToScan) {
    const priceMatch = textToScan.match(/(?:₹|\$|rs\.?|usd|inr)\s?(\d+(?:[.,]\d{2})?)/i);
    return priceMatch ? priceMatch[1] : "0";
  }

  static detectTypeFallback(textToScan) {
    if (/\b(credited|credit|received|refunded|deposited|reversal)\b/i.test(textToScan)) {
      return 'credit';
    }
    return 'debit';
  }
}
module.exports = TransactionParsingEngine;