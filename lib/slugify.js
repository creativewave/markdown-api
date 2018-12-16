
const compose = require('lodash/fp/compose')
const replace = require('lodash/fp/replace')
const toLower = require('lodash/fp/toLower')
const trimChars = require('lodash/fp/trimChars')

/**
 * slugify :: String -> String
 */
const slugify = compose(
    toLower,
    trimChars(/-/),
    replace(/--+/g, '-'),
    replace(/[\s\W-]+/g, '-'),
    replace(/[ù|û]/g, 'u'),
    replace(/[é|è|ê]/g, 'e'),
    replace(/[à|â]/g, 'a'),
)

module.exports = slugify
