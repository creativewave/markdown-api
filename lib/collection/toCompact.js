
const filterReducer = require('./filterReducer')
const transduce = require('./transduce')

/**
 * toCompact :: Collection c => c a -> c a
 *
 * Collection => Foldable|Iterable
 *
 * It should remove all falsey values from a `Collection`.
 */
const toCompact = monoid => transduce(filterReducer(item => Array.isArray(item) ? item[1] : item), monoid)

module.exports = toCompact
