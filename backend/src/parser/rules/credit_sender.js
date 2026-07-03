/**
 * Credit Sender specific extraction rules
 */

const rules = [
    {
        name: 'HDFC_CREDIT_SENDER_DETAILS',
        tier: 1,
        // Matches exact transaction details format: Sender: VIKRAM RATHORE (VPA: vikramrathore23@okaxis)
        pattern: /Sender:\s*(.*?)\s*\(VPA:\s*(.*?)\)/i,
        extract: (match) => ({
            senderName: match[1].trim(),
            rawVpa: match[2].trim(),
            transactionType: 'Credit'
        })
    },
    {
        name: 'GENERIC_CREDIT_INLINE_VPA',
        tier: 2,
        // Matches inline text like: is credited to your account from VIKRAM RATHORE (VPA: vikramrathore23@okaxis)
        pattern: /credit(?:ed)?.*?from\s+(.*?)\s*\(VPA:\s*(.*?)\)/i,
        extract: (match) => ({
            senderName: match[1].trim(),
            rawVpa: match[2].trim(),
            transactionType: 'Credit'
        })
    },
    {
        name: 'GENERIC_CREDIT_VPA_ONLY',
        tier: 3,
        // Matches inline fallbacks with only VPA: credited from VPA amazon@upi
        pattern: /credit(?:ed)?.*?from\s+(?:VPA|UPI(?: ID)?)\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i,
        extract: (match) => ({
            senderName: null, // No display name present
            rawVpa: match[1].trim(),
            transactionType: 'Credit'
        })
    }
];

module.exports = rules;
