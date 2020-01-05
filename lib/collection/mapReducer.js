
/**
 * mapReducer :: (b -> a) -> r -> r
 *
 * r(educer) :: (b -> a) -> b
 */
const mapReducer = transform => reduce => (initialValue = reduce(), value) =>
    reduce(initialValue, transform(value))

module.exports = mapReducer
