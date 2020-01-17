
/**
 * merge :: Collection c => (c a -> c a) -> c a
 *
 * Collection => Array|Object|Map|Set
 *
 * Memo: `...Collection, ...Collection` is the most readable way to merge two
 * `Object`s or `Array`s, therefore `merge` is only meant be used in function
 * compositions such as in the final step of a transducer.
 */
const merge = (a, b) => {
    if (Array.isArray(a)) {
        return a.concat(b)
    } else if (a.set === Map.prototype.set) {
        return new Map([...a].concat([...b]))
    } else if (a.add === Set.prototype.add) {
        return new Set([...a].concat(...b))
    }
    return { ...a, ...b }
}

module.exports = merge
