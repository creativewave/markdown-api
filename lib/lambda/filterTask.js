
const curry = require('lodash/fp/curry')
const Task = require('folktale/concurrency/task')

/**
 * filterTask :: Traversable t => (a -> Task Error Bool) -> t a -> Task Error t a
 *
 * It waits for the parallel application of a function over a `Traversable`'s
 * collection using a single iteration.
 *
 * `filterTask(listItemPredicateTask)` is an alias and an optimized and curried
 * version of `Task.waitAll(list.map(listItemPredicateTask))`.
 *
 * TODO(refactoring): until native `Array` implements `traverse` and `of`, use
 * this implementation or just simplify it using a transducer.
 */
const filterTask = curry((predicateTask, list) => 0 < list.length
    ? list.reduce(
        (task, item) => task.and(predicateTask(item)).map(([list, result]) =>
            result ? list.concat([item]) : result),
        Task.of([]))
    : Task.of(list))

module.exports = filterTask
