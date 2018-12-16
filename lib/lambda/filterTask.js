
const curry = require('lodash/fp/curry')
// const filter = require('lodash/fp/filter')
const Task = require('folktale/concurrency/task')

/**
 * filterTask :: Traversable t => (a -> Task Error Bool) -> t a -> Task Error t a
 *
 * It waits for the parallel application of a function over a `Traversable`'s
 * value using its `filter` interface.
 *
 * `filterTask(listItemPredicateTask)` is just an alias and a curried version of
 * `Task.waitAll(list.map(listItemPredicateTask))`
 *
 * TODO: test current version (single iteration instead of two). If it's ok, it
 * would change function description to:
 *
 * "It waits for the parallel application of a function over a `Traversable`'s
 * collection using a single iteration."
 *
 * @see `./mapTask.js` for more details.
 */
// const filterTask = curry((predicateTask, list) => Task.waitAll(filter(predicateTask, list)))
// Rewrite with a single iteration
const filterTask = curry((predicateTask, list) => 0 < list.length
    ? list.reduce(
        (task, item) => task.and(predicateTask(item)).map(([list, result]) =>
            result ? list.concat([item]) : result),
        Task.of([]))
    : Task.of(list))

module.exports = filterTask
