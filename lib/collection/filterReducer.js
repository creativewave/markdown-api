
/**
 * filterReducer :: ((a -> Boolean) -> r) -> r
 *
 * r(educer) :: Collection c => (c a -> a) -> c a
 */
const filterReducer = predicate => reduce => (initialValue = reduce(), value) =>
    predicate(value) ? reduce(initialValue, value) : initialValue

module.exports = filterReducer
