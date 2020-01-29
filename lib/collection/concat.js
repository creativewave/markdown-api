
/**
 * concat :: Collection c => (c a -> a) -> c a
 *
 * Collection => SemiGroup|Iterable|Number|Boolean
 *
 * Memo: `...Collection, value` is the most readable way to append new value(s)
 * into an `Object` or an `Array` and it should always be used despite the few
 * microseconds that could be saved by mutating a large collection, therefore
 * this function is only meant to be used in function compositions, such as in
 * the final step of a transducer.
 */
const concat = (collection, entry) => {
    if (Array.isArray(collection)) {
        return collection.concat([entry])
    } else if (typeof collection.concat === 'function') {
        return collection.concat(entry)
    /* eslint-disable no-prototype-builtins */
    } else if (Map.prototype.isPrototypeOf(collection)) {
        return collection.set(...entry)
    } else if (Set.prototype.isPrototypeOf(collection)) {
        return collection.add(entry)
    }
    /* eslint-enable no-prototype-builtins */
    switch (typeof collection) {
        case 'boolean':
            return collection && entry
        case 'number':
            return collection + entry
        case 'object':
            return { ...collection, [entry[0]]: entry[1] }
        default:
            throw Error(`Unable to concatenate a value into a type \`${typeof collection}\``)
    }
}

module.exports = concat
