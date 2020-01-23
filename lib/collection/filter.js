
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const into = require('./into')
const filterReducer = require('./filterReducer')

/**
 * filter :: Collection c => (a -> Boolean) -> c a -> c a
 *
 * Collection => Functor|Iterable
 */
const filter = curry((predicate, collection) =>
    typeof collection.filter === 'function'
        ? collection.filter(a => predicate(a))
        : into(empty(collection), filterReducer(predicate), collection))

module.exports = filter
