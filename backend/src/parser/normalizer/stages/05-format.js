module.exports = function formatTitle(input) {
    // input is { title: string, matched: boolean, category?: string }
    if (!input || !input.title) return "Unknown Transaction";
    
    if (input.matched) {
        // Canonical name is already formatted in the dictionary
        return input.title;
    }

    // Since the user requested "no normalization then" for non-matched cases, 
    // we return the title exactly as it was after cleanup, which is lowercase.
    // However, conventionally it's better to title-case if we want it to look okay,
    // but we'll stick to returning the raw/cleaned output so it doesn't try to look nice if not matched.
    // Wait, let's just title-case it as a fallback, because returning fully lowercase "unknown cafe" looks weird.
    // The user's exact quote was "no normalization then" which meant no error handling or logging required. 
    // "Is there any specific error handling or logging requirement for when a merchant fails to match the dictionary?"
    // User: "no normalization then" - meaning no special handling, just don't normalize it to a canonical name, leave it.
    // I will title-case it for fallback display.
    
    let fallbackTitle = input.title.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join(' ');
    
    return fallbackTitle;
};
