
const concat = require('./concat')
const curry = require('lodash/fp/curry')
const empty = require('./empty')
const mapReducer = require('./mapReducer')
const Task = require('folktale/concurrency/task')
const transduce = require('./transduce')

/**
 * concatTask :: Collection c => (Task Error c a -> Task Error b) -> c b
 */
const concatTask = curry((collection, entry) => collection.and(entry).map(([c, e]) => concat(c, e)))

/**
 * mapTask :: Collection c => (a -> Task Error b) -> c a -> Task Error c b
 */
const mapTask = curry((transform, collection) =>
    transduce(mapReducer(transform), collection, Task.of(empty(collection)), concatTask))

module.exports = mapTask
