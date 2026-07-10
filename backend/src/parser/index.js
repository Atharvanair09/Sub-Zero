/**
 * Transaction Parser Module
 */

const { parseEmail } = require('./engine');
const { extractCreditSender } = require('./creditSenderExtractor');
const { validateTransactionEmail } = require('./validator');

module.exports = {
    parseEmail,
    extractCreditSender,
    validateTransactionEmail
};
