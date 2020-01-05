
/**
 * empty :: Collection c => c a -> c void
 *
 * Collection => Monoid|Iterable|Number|Boolean
 */
const empty = collection => {
    if (typeof collection.empty === 'function') {
        return collection.empty()
    }
    if (collection.set === Map.prototype.set) {
        return new Map()
    }
    if (collection.add === Set.prototype.add) {
        return new Set()
    }
    if (Array.isArray(collection)) {
        return []
    }
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
            throw Error(`Unable to create an empty value of type \`${typeof collection}\``)
    }
}

module.exports = empty
