/**
 * HDFC Bank specific rules
 */

const rules = [
    {
        name: 'HDFC_DEBIT_UPI',
        tier: 1,
        // Example: Rs.978.33 is debited from your account ending 1234 towards VPA zomato.eternaltsp.payu@hdfcbank (Zomato) on 26-06-26.
        // Captures: 1=Amount, 2=Raw Title
        pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+is debited.*?towards\s+(.*?)(?=\s+on\b|\s+date\b|\.$)/i,
        extract: (match) => ({
            amount: match[1].replace(/,/g, ''),
            rawTitle: match[2],
            transactionType: 'Debit'
        })
    },
    {
        name: 'HDFC_CREDIT_UPI',
        tier: 1,
        // Example: Rs.500.00 is credited to your account ending 1234 from VPA amazon@hdfcbank (Amazon) on 26-06-26.
        pattern: /Rs\.?\s*([\d,]+\.?\d*)\s+is credited.*?from\s+(.*?)(?=\s+on\b|\s+date\b|\.$)/i,
        extract: (match) => ({
            amount: match[1].replace(/,/g, ''),
            rawTitle: match[2],
            transactionType: 'Credit'
        })
    }
];

module.exports = rules;
