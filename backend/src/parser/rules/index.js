/**
 * Rule aggregator
 */

const hdfcRules = require('./hdfc');
const genericRules = require('./generic');

// Combine all rules
const allRules = [
    ...hdfcRules,
    ...genericRules
];

// Sort rules by tier (1 is highest priority)
allRules.sort((a, b) => a.tier - b.tier);

module.exports = allRules;
