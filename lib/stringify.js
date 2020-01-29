
const into = require('./collection/into')
const mapReducer = require('./collection/mapReducer')

/**
 * getStringifiedValue :: a -> String
 *
 * Memo: it uses `\n` and `\t` between tokens while `JSON.stringify()` only uses
 * spaces.
 */
const stringify = value => {
    switch (typeof value) {
        case 'object':
            return Array.isArray(value)
                ? `[${value.map(stringify).join(', ')}]`
                : into('\n', mapReducer(([prop, value]) => `\t${prop}: ${stringify(value)},\n`), value)
        case 'string':
            return `'${value}'`
        default:
            return value
    }
}

module.exports = stringify
