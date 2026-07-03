/**
 * Merchant Normalization System
 * 
 * Cleans up raw titles into user-friendly display titles using a deterministic pipeline
 * of preprocessing, legal suffix stripping, regex replacement, and dictionary matching.
 */

const pipeline = require('./pipeline');
const formatTitleStage = require('./stages/05-format');

function normalizeTitle(rawTitle) {
    if (!rawTitle) return "Unknown Transaction";
    return pipeline.execute(rawTitle);
}

function formatDisplayTitle(name) {
    if (!name) return "Unknown Sender";
    // Reuse the 05-format stage which title-cases strings when not matched
    // We pass an object because 05-format expects { title: string, matched: boolean }
    return formatTitleStage({ title: name.toLowerCase(), matched: false });
}

module.exports = {
    normalizeTitle,
    formatDisplayTitle
};
