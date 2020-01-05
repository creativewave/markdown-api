
const curry = require('lodash/fp/curry')

/**
 * concat :: Collection c => c a -> a -> c a
 *
 * Collection => SemiGroup|Iterable|Number|Boolean
 *
 * Memo: `...Collection, value` is the most readable way to append new value(s)
 * into an `Object` or an `Array` and it should always be used despite the few
 * microseconds that could be saved by mutating a large collection, therefore
 * this function is only meant be used to fold values into a `SemiGroup`, `Set`,
 * `Map`, `Object`, `Number`, `String`, or `Boolean`, such as for the final step
 * of a transduction.
 */
const concat = curry((collection, entry) => {
    if (typeof collection.concat === 'function') {
        if (Array.isArray(collection)) {
            return collection.concat([entry])
        }
        return collection.concat(entry)
    }
    if (collection.set === Map.prototype.set) {
        return collection.set(...entry)
    }
    if (collection.add === Set.prototype.add) {
        return collection.add(entry)
    }
    switch (typeof collection) {
        case 'boolean':
            return collection && entry
        case 'number':
            return collection + entry
        case 'object':
            return { ...collection, [entry[0]]: entry[1] }
        case 'string':
            return `${collection}${entry}`
        default:
            throw Error(`Unable to concatenate value of type \`${entry}\` to type \`${collection}\``)
    }
})

module.exports = concat
