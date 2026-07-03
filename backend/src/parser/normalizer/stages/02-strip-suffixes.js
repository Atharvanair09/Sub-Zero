const suffixes = require('../dictionaries/suffixes.json');

module.exports = function stripSuffixes(title) {
    if (!title) return "";
    
    let currentTitle = title;
    
    // Sort suffixes by length descending so we match longest first (e.g. "private limited" before "limited")
    const sortedSuffixes = [...suffixes].sort((a, b) => b.length - a.length);

    for (const suffix of sortedSuffixes) {
        // Build regex to match suffix at the end of the string, with optional preceding space
        // Using word boundary \b to ensure we don't partially match (e.g., stripping "inc" from "zinc")
        const regex = new RegExp(`\\b${suffix.replace(/\./g, '\\.')}\\b$`, 'i');
        if (regex.test(currentTitle)) {
            currentTitle = currentTitle.replace(regex, '').trim();
            break; // Stop after removing the primary legal suffix
        }
    }

    return currentTitle;
};
