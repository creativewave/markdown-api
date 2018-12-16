
/**
 * mapReducer :: (b -> a) -> r
 *
 * r :: (b -> a) -> b
 *
 * References:
 * - https://github.com/ramda/ramda/tree/v0.26.1/source/mapAccum.js
 */
const mapReducer = transform => reduce => (initialValue = reduce(), value) =>
    reduce(initialValue, transform(value))

module.exports = mapReducer
