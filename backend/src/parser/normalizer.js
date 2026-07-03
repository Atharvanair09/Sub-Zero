/**
 * Normalizer module
 * Cleans up raw titles into user-friendly display titles.
 */

function normalizeTitle(rawTitle) {
    if (!rawTitle) return "Unknown Transaction";

    let title = rawTitle.trim();

    // Strategy 1: If there's a name in parentheses, extract it.
    // e.g., "VPA zomato.eternaltsp.payu@hdfcbank (Zomato)" -> "Zomato"
    const parenMatch = title.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
        title = parenMatch[1];
    } else {
        // Strategy 2: Remove common VPA/UPI prefixes if no parentheses are found.
        // e.g., "VPA amazon@ybl" -> "amazon@ybl"
        title = title.replace(/^(?:VPA|UPI(?: ID)?)\s+/i, '');

        // Strategy 3: Try to extract domain-like prefixes before the @ in a UPI ID
        // e.g. "zomato@hdfcbank" -> "zomato"
        // e.g. "paytm-qr@paytm" -> "paytm-qr"
        const atMatch = title.match(/^([a-zA-Z0-9.\-_]+)@[a-zA-Z0-9]+$/);
        if (atMatch && atMatch[1]) {
            title = atMatch[1];
        }
    }

    // Common cleanup
    // Remove dashes, underscores, dots from the resulting string if it looks like a system ID
    // Actually, replacing them with spaces might be better for readability.
    title = title.replace(/[.\-_]/g, ' ');

    // Normalize multiple spaces
    title = title.replace(/\s+/g, ' ').trim();

    // Title Case the output
    title = title.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');

    return title || "Unknown Transaction";
}

module.exports = {
    normalizeTitle
};
