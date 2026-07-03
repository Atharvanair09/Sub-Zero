const preprocess = require('./stages/01-preprocess');
const stripSuffixes = require('./stages/02-strip-suffixes');
const regexReplace = require('./stages/03-regex-replace');
const dictionaryMatch = require('./stages/04-dictionary-match');
const formatTitle = require('./stages/05-format');

class NormalizationPipeline {
    constructor() {
        this.stages = [
            preprocess,
            stripSuffixes,
            regexReplace,
            dictionaryMatch,
            formatTitle
        ];
    }

    execute(rawTitle) {
        let result = rawTitle;
        for (const stage of this.stages) {
            result = stage(result);
        }
        return result;
    }
}

module.exports = new NormalizationPipeline();
