
const curry = require('lodash/fp/curry')
const Task = require('folktale/concurrency/task')

/**
 * mapTask :: Traversable t => (a -> Task Error b) -> t a -> Task Error t b
 *
 * It waits for the parallel application of a function over a `Traversable`'s
 * collection using a single iteration.
 *
 * `mapTask(listItemTransformTask)` is an alias and an optimized and curried
 * version of `Task.waitAll(list.map(listItemTransformTask))`.
 *
 * `Traversable`s are `Functor`s and `Foldable`s at the same time. They must
 * implement `traverse`, `map`, and `.reduce`. This function is implemented to
 * only handle native `Array`s for now, which are native `List`s without a
 * `traverse` method. `Array`s are `Functor`s, `Foldable`, `Semigroup` (they
 * must implement `concat`), and `Monoid`s (`[] === Array.empty()`).
 *
 * The implementation may respect the current signature later and only expect
 * using `reduce`, `map` and/or `traverse`. Using reduce means defining the
 * initial value as argument or using `empty` ie. a Monoid default value.
 *
 * TODO(refactoring): until native `Array` implements `traverse` and `of`, use
 * this implementation or just simplify it using a transducer.
 */
const mapTask = curry((transformTask, list) =>
    list.reduce((task, item) =>
        task.and(transformTask(item)).map(([list, result]) => list.concat([result])),
    Task.of([])))

module.exports = mapTask
