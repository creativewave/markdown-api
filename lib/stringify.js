
/**
 * getStringifiedValue :: a -> String
 *
 * TODO: describe how this is different than JSON.stringify()
 */
const stringify = value => {
    switch (typeof value) {
        case 'object':
            return Array.isArray(value)
                ? `[${value.map(stringify).join(', ')}]`
                : `{\n${Object.entries(value).reduce((before, [prop, value]) =>
                    `${before}\t${prop}: ${stringify(value)},\n`, '')}}`
        case 'string':
            return `'${value}'`
        default:
            return value
    }
}

module.exports = stringify
