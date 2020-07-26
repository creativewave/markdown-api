
const curry = require('lodash/fp/curry')
const Task = require('folktale/concurrency/task')
const traverse = require('./traverse')

/**
 * mapTask :: Collection c => ((a -> Task Error b) -> c a) -> Task Error c b
 *
 * Collection => Traversable|Iterable
 */
const mapTask = curry((transform, collection) => traverse(Task, transform, collection))

module.exports = mapTask
