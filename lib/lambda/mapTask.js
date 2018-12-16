
// const map = require('./map')
const curry = require('lodash/fp/curry')
const Task = require('folktale/concurrency/task')

/**
 * mapTask :: Traversable t => (a -> Task Error b) -> t a -> Task Error t b
 *
 * It waits for the parallel application of a function over a `Traversable`'s
 * value using its `map` interface.
 *
 * `mapTask(listItemTransformTask)` is just an alias and a curried version of
 * `Task.waitAll(list.map(listItemTransformTask))`
 *
 * `Traversable`s are `Functor`s and `Foldable`s at the same time. They must
 * implement `traverse`, `map`, and `.reduce`. This function is implemented to
 * only handle native `Array`s for now, which are native `List`s without a
 * `traverse` method. `Array`s are `Functor`s, `Foldable`, and `Semigroup` (they
 * must also implement `concat`).
 * The implementation may respect the current signature later and only expect
 * using `reduce`, `map` and/or `traverse`. Using reduce means defining the
 * initial value as argument or using `empty` ie. a Monoid default value.
 *
 * TODO: test current version (single iteration instead of two). If it's ok, it
 * would change function description to:
 *
 * "It waits for the parallel application of a function over a `Traversable`'s
 * collection using a single iteration."
 *
 * TODO: learn more on `traverse` patterns and see if it might help here, eg. by
 * using `List`s instead of `Array`s. `traverse` is somewhat related to defining
 * the type to fold the foldable collection into. It might also be related to
 * make an implementation using transducers.
 */
// const mapTask = curry((transformTask, list) => Task.waitAll(map(transformTask, list)))
// Rewrite with a single iteration
const mapTask = curry((transformTask, list) =>
    list.reduce((task, item) =>
        task.and(transformTask(item)).map(([list, result]) => list.concat([result])),
    Task.of([])))

module.exports = mapTask
