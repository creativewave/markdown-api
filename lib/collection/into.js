
const curry = require('lodash/fp/curry')
const transduce = require('./transduce')
const concat = require('./concat')

/**
 * into :: Collection c => (c b -> (r -> r) -> c a) -> c b
 *
 * Collection => Foldable|Iterable
 * r(educer) :: (c b -> a) -> c b
 *
 * Memo: it accepts a `Collection` as the destination value (`seed`), as well as
 * a `Number` or `Boolean`.
 */
const into = curry((seed, transducer, collection) =>
    transduce(transducer, collection, seed, concat))

module.exports = into
