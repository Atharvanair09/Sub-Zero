/**
 * Preprocessor module
 * Cleans the raw email string to make it easier for regex rules to match.
 */

function cleanText(rawHtmlOrText) {
    if (!rawHtmlOrText || typeof rawHtmlOrText !== 'string') return '';

    let text = rawHtmlOrText;

    // 1. Remove HTML tags if any exist (very rudimentary strip)
    text = text.replace(/<[^>]*>?/gm, ' ');

    // 2. Remove zero-width spaces, non-breaking spaces, and other invisible characters
    text = text.replace(/[\u200B-\u200D\uFEFF]/g, '');
    text = text.replace(/&nbsp;/gi, ' ');

    // 3. Normalize newlines to spaces (so regexes can match across lines easily if needed)
    // Though for some banks, newlines are delimiters. We will replace multiple newlines with a single space.
    text = text.replace(/\r?\n|\r/g, ' ');

    // 4. Normalize multiple spaces into a single space
    text = text.replace(/\s+/g, ' ');

    // 5. Trim leading and trailing spaces
    return text.trim();
}

module.exports = {
    cleanText
};
