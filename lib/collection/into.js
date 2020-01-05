
const curry = require('lodash/fp/curry')
const transduce = require('./transduce')
const concat = require('./concat')

/**
 * transduce :: Collection c => a -> (r -> r) -> c b -> a
 *
 * Collection => Foldable|Iterable
 * r(educer) :: (b -> d) -> a
 *
 * Memo: it accepts a `Collection` as the destination value (`seed`), as well as
 * a `Number` or `Boolean`.
 */
const into = curry((seed, transducer, collection) =>
    transduce(transducer, collection, seed, concat))

module.exports = into
