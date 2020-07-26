
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const Task = require('folktale/concurrency/task')
const into = require('./into')

/**
 * filterTaskReducer :: (a -> Task Error Boolean) -> r -> r
 *
 * r(educer) :: Collection c => (c a -> a) -> c a
 */
const filterTaskReducer = predicate => reduce => (initialValue, value) =>
    initialValue.map(c => include => include ? reduce(c, value) : c).apply(predicate(value))

/**
 * filterTask :: Collection c => ((a -> Task Error Boolean) -> c a) -> Task Error c a
 */
const filterTask = curry((predicate, collection) =>
    into(Task.of(empty(collection)), filterTaskReducer(predicate), collection))

module.exports = filterTask
