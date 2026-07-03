/**
 * Transaction Extraction Engine
 * Main orchestrator for parsing transaction emails.
 */

const { cleanText } = require('./preprocessor');
const { normalizeTitle } = require('./normalizer');
const { calculateConfidence } = require('./scorer');
const rules = require('./rules');

function parseEmail(rawEmailBody) {
    // 1. Preprocess the raw email body
    const cleanedText = cleanText(rawEmailBody);

    if (!cleanedText) {
        return _fallbackResult();
    }

    // 2. Iterate through rules by priority
    for (const rule of rules) {
        try {
            const match = cleanedText.match(rule.pattern);
            
            if (match) {
                // 3. Extractor
                const extractedData = rule.extract(match);
                
                // 4. Normalizer
                const displayTitle = normalizeTitle(extractedData.rawTitle);

                // 5. Scorer
                const confidence = calculateConfidence(rule.tier, displayTitle, extractedData.rawTitle);

                return {
                    displayTitle,
                    rawTitle: extractedData.rawTitle ? extractedData.rawTitle.trim() : null,
                    transactionType: extractedData.transactionType,
                    amount: extractedData.amount || null,
                    confidence
                };
            }
        } catch (error) {
            // Log the error but continue to the next rule
            console.error(`Error executing rule ${rule.name}:`, error.message);
        }
    }

    // 6. No match found
    return _fallbackResult();
}

function _fallbackResult() {
    return {
        displayTitle: "Unknown Transaction",
        rawTitle: null,
        transactionType: "Unknown",
        amount: null,
        confidence: 0.0
    };
}

module.exports = {
    parseEmail
};
