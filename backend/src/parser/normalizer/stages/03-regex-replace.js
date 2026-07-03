const rules = require('../dictionaries/regex-rules.json');

module.exports = function regexReplace(title) {
    if (!title) return "";
    
    let currentTitle = title;

    for (const rule of rules) {
        const regex = new RegExp(rule.pattern, 'ig');
        currentTitle = currentTitle.replace(regex, rule.replacement);
    }
    
    // Clean up multiple spaces again just in case replacements introduced some
    return currentTitle.replace(/\s+/g, ' ').trim();
};
