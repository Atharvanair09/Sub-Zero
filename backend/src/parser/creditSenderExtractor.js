/**
 * Credit Sender Extractor
 * Deterministically extracts the sender's name and VPA from credit emails.
 */

const { cleanText } = require('./preprocessor');
const { formatDisplayTitle } = require('./normalizer');
const rules = require('./rules/credit_sender');

function extractCreditSender(rawEmailBody) {
    const cleanedText = cleanText(rawEmailBody);
    
    if (!cleanedText) {
        return _fallbackResult();
    }

    for (const rule of rules) {
        try {
            const regex = new RegExp(rule.pattern.source, rule.pattern.flags.includes('g') ? rule.pattern.flags : rule.pattern.flags + 'g');
            let match;
            while ((match = regex.exec(cleanedText)) !== null) {
                const extractedData = rule.extract(match);
                if (!extractedData) continue;
                
                let displayTitle = "Unknown Sender";
                if (extractedData.senderName) {
                    displayTitle = formatDisplayTitle(extractedData.senderName);
                } else if (extractedData.rawVpa) {
                    // Fallback to formatting the first part of VPA if no name is available
                    const vpaName = extractedData.rawVpa.split('@')[0];
                    // Replace potential dots/underscores with space before title-casing
                    const cleanedVpaName = vpaName.replace(/[._]/g, ' ');
                    displayTitle = formatDisplayTitle(cleanedVpaName);
                }
                
                // Deterministic confidence scoring based on rule priority
                let confidence = 0.0;
                if (rule.tier === 1) confidence = 0.99;
                else if (rule.tier === 2) confidence = 0.90;
                else if (rule.tier === 3) confidence = 0.80;

                return {
                    displayTitle,
                    rawTitle: extractedData.rawVpa || null,
                    transactionType: extractedData.transactionType,
                    confidence
                };
            }
        } catch (error) {
            console.error(`Error executing credit sender rule ${rule.name}:`, error.message);
        }
    }
    
    return _fallbackResult();
}

function _fallbackResult() {
    return {
        displayTitle: "Unknown Sender",
        rawTitle: null,
        transactionType: "Credit",
        confidence: 0.0
    };
}

module.exports = {
    extractCreditSender
};
