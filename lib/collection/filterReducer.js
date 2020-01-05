
/**
 * filterReducer :: (a -> Boolean) -> r -> r
 *
 * r(educer) :: (b -> a) -> b
 */
const filterReducer = predicate => reduce => (initialValue = reduce(), value) =>
    predicate(value) ? reduce(initialValue, value) : initialValue

module.exports = filterReducer
