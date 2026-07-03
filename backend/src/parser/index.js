/**
 * Transaction Parser Module
 */

const { parseEmail } = require('./engine');
const { extractCreditSender } = require('./creditSenderExtractor');

module.exports = {
    parseEmail,
    extractCreditSender
};
