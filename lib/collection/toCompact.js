
const filterReducer = require('./filterReducer')
const transduce = require('./transduce')

/**
 * toCompact :: Collection c => c a -> c a
 *
 * Collection => Foldable|Iterable
 *
 * It should remove all falsey values from a `Collection`.
 */
const toCompact = monoid => transduce(filterReducer(a => Array.isArray(a) ? a[1] : a), monoid)

module.exports = toCompact
