
const curry = require('lodash/fp/curry')
const unary = require('lodash/fp/unary')
const empty = require('./empty')
const into = require('./into')
const mapReducer = require('./mapReducer')

/**
 * map :: Collection c => (a -> b) -> c a -> c b
 *
 * Collection => Functor|Iterable
 */
const map = curry((transform, collection) =>
    typeof collection.map === 'function'
        ? collection.map(unary(transform))
        : into(empty(collection), mapReducer(transform), collection))

module.exports = map
