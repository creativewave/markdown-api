
const curry = require('lodash/fp/curry')
const unary = require('lodash/fp/unary')
const empty = require('./empty')
const into = require('./into')
const filterReducer = require('./filterReducer')

/**
 * filter :: Collection c => (a -> Boolean) -> c a -> c a
 *
 * Collection => Functor|Iterable
 */
const filter = curry((transform, collection) =>
    typeof collection.filter === 'function'
        ? collection.filter(unary(transform))
        : into(empty(collection), filterReducer(transform), collection))

module.exports = filter
