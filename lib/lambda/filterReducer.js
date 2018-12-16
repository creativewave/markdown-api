
/**
 * filterReducer :: r -> r -> (b -> a) -> b
 *
 * r :: (b -> a) -> b
 *
 * References:
 * - ?
 */
const filterReducer = predicate => reduce => (initialValue = reduce(), value) =>
    predicate(value) ? reduce(initialValue, value) : initialValue

module.exports = filterReducer
