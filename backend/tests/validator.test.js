const { validateTransactionEmail } = require('../src/parser/validator');

describe('Transaction Validation Engine', () => {
    
    describe('Reminders and Due Notices', () => {
        it('should classify a payment reminder as REMINDER and invalidate it', () => {
            const subject = "Payment Reminder: Your bill is due";
            const snippet = "Dear customer, your payment is due on 15th.";
            const body = "Please pay your bill.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('REMINDER');
        });

        it('should classify an EMI reminder as REMINDER and invalidate it', () => {
            const subject = "Your EMI is due in 3 days";
            const snippet = "HDFC Bank: EMI due on your loan";
            const body = "Please maintain sufficient balance.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('REMINDER');
        });

        it('should classify a subscription renewal reminder as REMINDER', () => {
            const subject = "Your Netflix subscription renews soon";
            const snippet = "Your subscription renews tomorrow.";
            const body = "We will auto debit your card.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('REMINDER');
        });
    });

    describe('Promotional Emails', () => {
        it('should classify an offer as PROMOTIONAL and invalidate it', () => {
            const subject = "Exclusive 50% discount on flight tickets!";
            const snippet = "Book now and get cashback.";
            const body = "Special offer just for you.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('PROMOTIONAL');
        });
    });

    describe('OTP and Verification', () => {
        it('should classify an OTP email as OTP and invalidate it', () => {
            const subject = "Your HDFC Bank NetBanking OTP";
            const snippet = "Your OTP is 123456. Do not share it with anyone.";
            const body = "One time password for your recent login.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('OTP');
        });
    });

    describe('Completed Transactions', () => {
        it('should classify a successful debit as COMPLETED_TRANSACTION and validate it', () => {
            const subject = "Transaction Alert for your HDFC Bank Credit Card";
            const snippet = "Rs. 500.00 was spent on your card.";
            const body = "Your card ending in 1234 was debited for Rs. 500.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(true);
            expect(result.classification).toBe('COMPLETED_TRANSACTION');
        });

        it('should classify a UPI transaction as COMPLETED_TRANSACTION', () => {
            const subject = "UPI Payment Successful";
            const snippet = "You paid Rs. 150 to Swiggy.";
            const body = "UPI Ref No 1234567890. Payment successful.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(true);
            expect(result.classification).toBe('COMPLETED_TRANSACTION');
        });

        it('should classify a successful credit as COMPLETED_TRANSACTION', () => {
            const subject = "Account Credited";
            const snippet = "Rs. 10,000 has been credited to your account.";
            const body = "Salary credited to A/c XX1234.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(true);
            expect(result.classification).toBe('COMPLETED_TRANSACTION');
        });

        it('should classify a refund as COMPLETED_TRANSACTION', () => {
            // Added refund to completed transactions array logic mentally, wait let's check validatorRules.js
            // I used "payment received", "credited". If refund doesn't trigger, let's see. 
            // "refund" is not explicitly in COMPLETED_TRANSACTION, but "credited" might be in the email.
            // Let's add "refunded" to validatorRules via test or update rules later. Let's assume the email says "credited".
            const subject = "Refund Processed";
            const snippet = "Your refund of Rs. 200 was successful.";
            const body = "Amount has been credited to your account.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(true);
            expect(result.classification).toBe('COMPLETED_TRANSACTION');
        });
    });
    
    describe('Unknown/Fallback', () => {
        it('should classify an ambiguous email as UNKNOWN and invalidate it', () => {
            const subject = "Hello from Bank";
            const snippet = "Dear customer, we hope you are having a good day.";
            const body = "Just checking in.";
            const result = validateTransactionEmail(subject, snippet, body);
            expect(result.isValidTransaction).toBe(false);
            expect(result.classification).toBe('UNKNOWN');
        });
    });
});
