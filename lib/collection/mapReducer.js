
/**
 * mapReducer :: Collection c => ((c a -> b) -> r) -> r
 *
 * r(educer) :: (c a -> b) -> c b
 */
const mapReducer = transform => reduce => (initialValue = reduce(), value) =>
    reduce(initialValue, transform(value))

module.exports = mapReducer
