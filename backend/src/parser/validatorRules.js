/**
 * Keywords and rules for deterministic email classification.
 */

const VALIDATION_RULES = {
    // 1. Reminders and Due Notices (Highest priority to avoid false positives)
    REMINDER: [
        "payment due",
        "upcoming payment",
        "reminder",
        "autopay scheduled",
        "bill due",
        "emi due",
        "subscription renews",
        "due on",
        "pay before",
        "scheduled payment",
        "renewal reminder",
        "payment reminder",
        "statement is ready",
        "minimum amount due",
        "total amount due",
        "auto debit scheduled"
    ],

    // 2. Promotional and Marketing
    PROMOTIONAL: [
        "offer",
        "cashback",
        "rewards",
        "discount",
        "advertisement",
        "sale",
        "exclusive deal",
        "save up to",
        "earn points",
        "special offer"
    ],

    // 3. OTP and Verifications
    OTP: [
        "otp",
        "one time password",
        "verification code",
        "do not share",
        "login code",
        "security code"
    ],

    // 4. Account Notifications
    ACCOUNT_NOTIFICATION: [
        "login alert",
        "account statement",
        "profile updated",
        "password changed",
        "device recognized",
        "new login"
    ],

    // 5. Completed Transactions (Only consider if none of the above match)
    COMPLETED_TRANSACTION: [
        "debited",
        "credited",
        "payment successful",
        "transaction successful",
        "upi ref no",
        "reference number",
        "transaction id",
        "successfully transferred",
        "payment received",
        "purchase successful",
        "settlement completed",
        "paid successfully",
        "money sent"
    ]
};

module.exports = VALIDATION_RULES;
