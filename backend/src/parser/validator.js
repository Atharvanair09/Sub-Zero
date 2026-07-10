const VALIDATION_RULES = require('./validatorRules');

/**
 * Validates whether an email is a genuine completed transaction.
 * 
 * @param {string} subject - Email subject
 * @param {string} snippet - Email snippet
 * @param {string} fullBody - Full body of the email
 * @returns {Object} { isValidTransaction: boolean, classification: string, reason: string }
 */
function validateTransactionEmail(subject, snippet, fullBody) {
    const textToScan = (subject + " " + snippet + " " + fullBody).toLowerCase();

    // Helper to check if any keyword from an array exists in the text
    const containsKeyword = (keywords) => {
        return keywords.some(keyword => textToScan.includes(keyword.toLowerCase()));
    };

    // 1. Check for Reminders / Due Notices (Highest Priority)
    if (containsKeyword(VALIDATION_RULES.REMINDER)) {
        return {
            isValidTransaction: false,
            classification: 'REMINDER',
            reason: 'Contains payment reminder or due notice keywords.'
        };
    }

    // 2. Check for Promotional Content
    if (containsKeyword(VALIDATION_RULES.PROMOTIONAL)) {
        return {
            isValidTransaction: false,
            classification: 'PROMOTIONAL',
            reason: 'Contains promotional or marketing keywords.'
        };
    }

    // 3. Check for OTPs
    if (containsKeyword(VALIDATION_RULES.OTP)) {
        return {
            isValidTransaction: false,
            classification: 'OTP',
            reason: 'Contains OTP or verification code keywords.'
        };
    }

    // 4. Check for Account Notifications
    if (containsKeyword(VALIDATION_RULES.ACCOUNT_NOTIFICATION)) {
        return {
            isValidTransaction: false,
            classification: 'ACCOUNT_NOTIFICATION',
            reason: 'Contains account-related notification keywords.'
        };
    }

    // 5. Check for Evidence of a Completed Transaction
    if (containsKeyword(VALIDATION_RULES.COMPLETED_TRANSACTION)) {
        return {
            isValidTransaction: true,
            classification: 'COMPLETED_TRANSACTION',
            reason: 'Contains evidence of a completed financial transaction.'
        };
    }

    // Fallback classification if no rules matched
    return {
        isValidTransaction: false,
        classification: 'UNKNOWN',
        reason: 'Does not contain sufficient evidence of a completed transaction.'
    };
}

module.exports = {
    validateTransactionEmail
};
