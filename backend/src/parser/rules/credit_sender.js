/**
 * Credit Sender specific extraction rules
 */

const priorityKeywords = [
    'Sender',
    'Received from',
    'From',
    'Transferred by',
    'Beneficiary',
    'Salary credited by',
    'Refund from',
    'Interest credited'
];

const rules = [
    // 1. Tier 1: Keywords with explicit VPA in parentheses
    {
        name: 'KEYWORD_WITH_VPA',
        tier: 1,
        pattern: /(?:Sender|Received from|From|Transferred by|Beneficiary|Salary credited by|Refund from|Interest credited)[\s:]+([^():]{1,60}?)\s*\((?:VPA|UPI(?: ID)?):\s*([^()]+)\)/i,
        extract: (match) => {
            const name = match[1].trim();
            const vpa = match[2].trim();
            
            // Reject if name contains boilerplate that indicates a false positive match across long text
            if (name.length > 50 || name.toLowerCase().includes('bank')) {
                return null;
            }
            
            return {
                senderName: name,
                rawVpa: vpa,
                transactionType: 'Credit'
            };
        }
    }
];

const stopWords = [
    '\\s+on\\b',
    '\\s+c\\.',
    '\\s+UPI\\b',
    '\\s+Ref',
    '\\s+at\\b',
    '\\s*\\(',
    '\\s+Rs\\.?\\b',
    '\\s+INR\\b',
    '\\s+ending\\b',
    '\\s+credited\\b',
    '\\.\\s',
    ',',
    '!',
    ':',
    '$'
];

const stopPattern = `(?:${stopWords.join('|')})`;

// 2. Tier 2: Priority Keywords matching standalone names
priorityKeywords.forEach((kw) => {
    rules.push({
        name: `KEYWORD_${kw.replace(/\s+/g, '_').toUpperCase()}`,
        tier: 2,
        pattern: new RegExp(`(?:^|[^a-zA-Z])(?:${kw})[\\s:]+([A-Za-z0-9\\s\\-_.]+?)${stopPattern}`, 'i'),
        extract: (match) => {
            let name = match[1].trim();
            if (name.toLowerCase().startsWith('vpa ')) {
                name = name.substring(4).trim();
            }
            if (!name || name.length < 2 || name.length > 40) return null;
            
            const lowerName = name.toLowerCase();
            if (lowerName.includes('bank') || lowerName.includes('greetings') || lowerName.includes('inform') || lowerName.includes('credited')) {
                return null;
            }
            
            if (name.includes('@')) {
                return { senderName: null, rawVpa: name, transactionType: 'Credit' };
            }
            
            return { senderName: name, rawVpa: null, transactionType: 'Credit' };
        }
    });
});

// 3. Tier 3: Generic VPA
rules.push({
    name: 'GENERIC_CREDIT_VPA_ONLY',
    tier: 3,
    pattern: /credit(?:ed)?.*?from\s+(?:VPA|UPI(?: ID)?)\s+([a-zA-Z0-9.\-_]+@[a-zA-Z0-9]+)/i,
    extract: (match) => ({
        senderName: null,
        rawVpa: match[1].trim(),
        transactionType: 'Credit'
    })
});

// 4. Tier 4: Fallback to Bank Name
rules.push({
    name: 'FALLBACK_BANK_NAME',
    tier: 4,
    pattern: /(HDFC|ICICI|SBI|Axis|Kotak|Yes\sBank|PNB|Bank\sof\sBaroda)[\s]+Bank/i,
    extract: (match) => ({
        senderName: match[0].trim(),
        rawVpa: null,
        transactionType: 'Credit'
    })
});

module.exports = rules;
