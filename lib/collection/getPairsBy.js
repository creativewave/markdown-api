
const curry = require('lodash/fp/curry')

/**
 * getPairsBy :: a -> b -> {a: c, b: d} -> [c, d]
 * getPairsBy :: a -> ({a: c} -> d) -> {a: c} -> [c, d]
 *
 * TODO (complete): it should work with any collection type, and should iterate
 * over the collection to pick two values, using either an index or a property
 * name of an element in the collection, or a function receiving the collection
 * and returning its own value.
 */
const getPairsBy = curry((key, f, obj) => [obj[key], typeof f === 'function' ? f(obj) : obj[f]])

module.exports = {
    getPairsBy,
}
