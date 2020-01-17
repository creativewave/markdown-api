
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const merge = require('./merge')
const transduce = require('./transduce')

/**
 * toFlat :: Collection c => ((r -> r) -> c a) -> c b
 *
 * r(educer) :: Collection c => (a -> c b) -> c b
 */
const toFlat = curry((transducer, collection) =>
    transduce(transducer, collection, empty(collection), merge))

module.exports = toFlat
