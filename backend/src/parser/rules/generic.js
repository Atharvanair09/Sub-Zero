/**
 * Generic fallback rules for any bank
 */

const rules = [
    {
        name: 'GENERIC_VPA_DEBIT',
        tier: 2,
        // Matches typical UPI Debit patterns mentioning VPA across banks.
        // e.g. "debited ... towards VPA amazon@paytm" or "debit by transfer ... towards VPA"
        pattern: /debit(?:ed)?.*?towards\s+(?:VPA|UPI(?: ID)?)\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+(?:\s*\([^)]+\))?)/i,
        extract: (match) => ({
            amount: null, // Hard to extract generic amount predictably without exact format, leave null if unknown
            rawTitle: match[1],
            transactionType: 'Debit'
        })
    },
    {
        name: 'GENERIC_VPA_CREDIT',
        tier: 2,
        // Matches typical UPI Credit patterns
        pattern: /credit(?:ed)?.*?from\s+(?:VPA|UPI(?: ID)?)\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+(?:\s*\([^)]+\))?)/i,
        extract: (match) => ({
            amount: null,
            rawTitle: match[1],
            transactionType: 'Credit'
        })
    },
    {
        name: 'GENERIC_SPENT_AT',
        tier: 3,
        // Broad catch-all: "spent Rs 500 at Amazon on..."
        pattern: /(?:spent|paid).*?(?:Rs\.?|INR)\s*([\d,]+\.?\d*)\s+at\s+(.*?)(?=\s+on\b|\s+date\b|\.$)/i,
        extract: (match) => ({
            amount: match[1].replace(/,/g, ''),
            rawTitle: match[2],
            transactionType: 'Debit'
        })
    },
    {
        name: 'GENERIC_DEBIT_TOWARDS',
        tier: 3,
        // Extremely broad catch-all: "debited towards Zepto"
        // Lookbehind not universally supported in older engines, so using capture group.
        pattern: /debited.*?towards\s+(.*?)(?=\s+on\b|\s+date\b|\.$)/i,
        extract: (match) => ({
            amount: null,
            rawTitle: match[1],
            transactionType: 'Debit'
        })
    }
];

module.exports = rules;
