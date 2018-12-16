
const curry = require('lodash/fp/curry')

/**
 * transduce :: Foldable f => (r -> r) -> r -> b -> f a -> b
 *
 * r(educer) :: (b -> a) -> b
 *
 * References:
 * - https://github.com/ramda/ramda/blob/v0.26.1/source/transduce.js
 */
const transduce = curry((transducer, reducer, seed, foldable) =>
    foldable.reduce(transducer(reducer), seed))

module.exports = transduce
