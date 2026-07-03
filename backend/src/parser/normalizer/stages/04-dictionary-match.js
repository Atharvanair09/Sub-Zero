const merchants = require('../dictionaries/merchants.json');

module.exports = function dictionaryMatch(title) {
    if (!title) return { title: "", matched: false };
    
    for (const [canonicalName, data] of Object.entries(merchants)) {
        if (title.toLowerCase() === canonicalName.toLowerCase()) {
            return { title: canonicalName, matched: true, category: data.category };
        }
        for (const alias of data.aliases) {
            if (title === alias.toLowerCase()) {
                return { title: canonicalName, matched: true, category: data.category };
            }
        }
    }
    
    return { title, matched: false };
};
