
const concat = require('./concat')
const empty = require('./empty')

/**
 * transduce :: Collection c => ((r -> r) -> c a -> c b) -> r
 *
 * Collection => Foldable|Iterable
 * r(educer) :: (c b -> a) -> c b
 */
const transduce = (transducer, collection, seed = empty(collection), reducer = concat) => {
    if (collection.reduce) return collection.reduce(transducer(reducer), seed)
    if (typeof collection[Symbol.iterator] === 'function') return [...collection].reduce(transducer(reducer), seed)
    if (typeof collection === 'object') return Object.entries(collection).reduce(transducer(reducer), seed)
    throw Error(`Unable to to transduce a collection of type \`${typeof collection}\``)
}

module.exports = transduce
