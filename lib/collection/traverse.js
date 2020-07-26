
const concat = require('./concat')
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const mapReducer = require('./mapReducer')
const transduce = require('./transduce')

/**
 * traverse :: Applicatif f, Collection c => (type f -> (a -> f b) -> c a) -> f (c b)
 *
 * Collection => Traversable|Iterable
 *
 * Memo: ideally, it should execute `collection.traverse(typeRep, transformer)`
 * but there's currently no native type (or custom type from this package) that
 * implements this method.
 */
const traverse = curry((Applicative, transformer, collection) =>
    transduce(
        mapReducer(transformer),
        collection,
        Applicative.of(empty(collection)),
        (collection, entry) => collection.map(c => e => concat(c, e)).apply(entry)))

module.exports = traverse
