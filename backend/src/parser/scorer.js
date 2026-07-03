/**
 * Scorer module
 * Assigns a confidence score to the extraction.
 */

function calculateConfidence(tier, displayTitle, rawTitle) {
    if (!rawTitle || !displayTitle || displayTitle === "Unknown Transaction") {
        return 0.0;
    }

    let score = 0.0;

    switch (tier) {
        case 1:
            // Tier 1 rules are highly specific.
            score = 1.0;
            break;
        case 2:
            // Tier 2 rules are VPA/UPI generic.
            // If the title was extracted from parentheses, it's highly confident.
            if (rawTitle.includes('(') && rawTitle.includes(')')) {
                score = 0.9;
            } else {
                score = 0.8;
            }
            break;
        case 3:
            // Tier 3 rules are very broad generic fallbacks.
            score = 0.5;
            break;
        default:
            score = 0.0;
    }

    return score;
}

module.exports = {
    calculateConfidence
};
