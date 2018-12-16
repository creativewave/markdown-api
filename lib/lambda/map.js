
const curry = require('lodash/fp/curry')
const unary = require('lodash/fp/unary')

/**
 * map :: Functor f => (a -> b) -> f a -> f b
 */
const map = curry((fn, F) => F.map(unary(fn)))

module.exports = map
