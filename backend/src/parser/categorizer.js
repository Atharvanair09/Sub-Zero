const categoryMap = {
    "Income": ["salary", "payroll", "dividend"],
    "Food & Dining": ["zomato", "swiggy", "blinkit", "zepto", "uber eats", "mcdonalds", "dominos", "kfc", "starbucks", "food", "restaurant", "cafe", "dining"],
    "Shopping": ["amazon", "flipkart", "myntra", "meesho", "ajio", "nykaa", "shopping"],
    "Transport": ["uber", "ola", "rapido", "namma yatri", "irctc", "makemytrip", "transport", "travel"],
    "Entertainment": ["pvr", "bookmyshow", "netflix", "prime video", "spotify", "valve", "steam", "playstation", "entertainment", "ott", "streaming", "music"],
    "Bills & Utilities": ["bescom", "jio", "airtel", "vi", "bsnl", "act fibernet", "electricity", "water", "gas", "bill", "recharge"],
    "Healthcare": ["apollo", "pharmeasy", "1mg", "practo", "health", "hospital", "clinic", "pharmacy"],
    "Travel": ["indigo", "agoda", "airbnb", "goibibo", "cleartrip", "flight", "hotel"],
    "Investments": ["zerodha", "groww", "upstox", "angel one", "indmoney", "investment", "mutual fund", "sip"],
    "Transfers": ["cred", "paytm", "phonepe", "gpay", "bharatpe", "transfer", "upi"],
    "Subscriptions": ["chatgpt", "github", "aws", "google cloud", "subscription"]
};

/**
 * Categorizes a transaction based on vendor name and email text.
 * @param {string} vendorName - The normalized vendor name.
 * @param {string} rawEmailText - The raw email text to scan as a fallback.
 * @returns {string} The matched category, or "Others" if none match.
 */
function categorizeTransaction(vendorName, rawEmailText) {
    const v = (vendorName || "").toLowerCase();
    const text = (rawEmailText || "").toLowerCase();

    // 1. Exact or partial match in categoryMap against vendorName
    for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(k => v.includes(k))) {
            return category;
        }
    }

    // 2. Keyword fallback in email body
    for (const [category, keywords] of Object.entries(categoryMap)) {
        if (keywords.some(k => text.includes(k))) {
            return category;
        }
    }

    return "Others";
}

module.exports = {
    categorizeTransaction,
    categoryMap
};
