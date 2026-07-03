module.exports = function preprocess(title) {
    if (!title) return "";
    
    // Lowercase and trim
    let cleanTitle = title.toLowerCase().trim();
    
    // Remove common VPA/UPI prefixes
    cleanTitle = cleanTitle.replace(/^(?:vpa|upi(?: id)?)\s+/i, '');
    
    // Extract domain-like prefixes before the @ in a UPI ID (if present)
    const atMatch = cleanTitle.match(/^([a-z0-9.\-_]+)@[a-z0-9]+$/);
    if (atMatch && atMatch[1]) {
        cleanTitle = atMatch[1];
    }
    
    // Extract names in parentheses if present
    const parenMatch = cleanTitle.match(/\(([^)]+)\)/);
    if (parenMatch && parenMatch[1]) {
        cleanTitle = parenMatch[1];
    }

    // Normalize multiple spaces
    cleanTitle = cleanTitle.replace(/\s+/g, ' ').trim();
    
    return cleanTitle;
};
