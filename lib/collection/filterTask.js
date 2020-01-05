
const concat = require('./concat')
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const Task = require('folktale/concurrency/task')
const transduce = require('./transduce')

/**
 * filterTaskReducer :: (a -> Task Error Boolean) -> r -> r
 *
 * r(educer) :: (b -> a) -> b
 */
const filterTaskReducer = predicate => reduce => (initialValue = reduce(), value) =>
    initialValue
        .and(predicate(value))
        .map(([initial, include]) => include ? reduce(initial, value) : initial)

/**
 * filterTask :: Collection c => (a -> Task Error Boolean) -> c a -> Task Error c b
 */
const filterTask = curry((predicate, collection) =>
    transduce(filterTaskReducer(predicate), collection, Task.of(empty(collection)), concat))

module.exports = filterTask
