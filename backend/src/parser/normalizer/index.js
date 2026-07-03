/**
 * Merchant Normalization System
 * 
 * Cleans up raw titles into user-friendly display titles using a deterministic pipeline
 * of preprocessing, legal suffix stripping, regex replacement, and dictionary matching.
 */

const pipeline = require('./pipeline');

function normalizeTitle(rawTitle) {
    if (!rawTitle) return "Unknown Transaction";
    return pipeline.execute(rawTitle);
}

module.exports = {
    normalizeTitle
};
