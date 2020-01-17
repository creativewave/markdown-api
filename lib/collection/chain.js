
const curry = require('lodash/fp/curry')
const mapReducer = require('./mapReducer')
const toFlat = require('./toFlat')

/**
 * chain :: Collection c => ((a -> c b) -> c a) -> c b
 *
 * Collection => Monad|Array|Object|Map|Set
 */
const chain = curry((transform, collection) => toFlat(mapReducer(transform), collection))

module.exports = chain
