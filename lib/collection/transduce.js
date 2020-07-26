
const concat = require('./concat')
const empty = require('./empty')

/**
 * transduce :: Collection c => ((r -> r) -> c a -> b) -> r
 *
 * Collection => Foldable|Iterable
 * r(educer) :: (b -> a) -> b
 *
 * Memo: a `Foldable` should be reduced with a function that always return a
 * value of the same type as `seed`.
 */
const transduce = (transducer, collection, seed = empty(collection), reducer = concat) => {
    if (collection.reduce) return collection.reduce(transducer(reducer), seed)
    if (typeof collection[Symbol.iterator] === 'function') return [...collection].reduce(transducer(reducer), seed)
    if (typeof collection === 'object') return Object.entries(collection).reduce(transducer(reducer), seed)
    throw Error(`Unable to transduce a \`${typeof collection}\``)
}

module.exports = transduce
