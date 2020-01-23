
/**
 * empty :: Collection c => c a -> c void
 *
 * Collection => Monoid|Iterable|Number|Boolean
 */
const empty = collection => {
    if (typeof collection.empty === 'function') {
        return collection.empty()
    } else if (Array.isArray(collection)) {
        return []
    /* eslint-disable no-prototype-builtins */
    } else if (Map.prototype.isPrototypeOf(collection)) {
        return new Map()
    } else if (Set.prototype.isPrototypeOf(collection)) {
        return new Set()
    }
    /* eslint-enable no-prototype-builtins */
    switch (typeof collection) {
        case 'boolean':
            return true
        case 'object':
            return {}
        case 'number':
            return 0
        case 'string':
            return ''
        default:
            throw Error(`Unable to create an empty \`${typeof collection}\``)
    }
}

module.exports = empty
