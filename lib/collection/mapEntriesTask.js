
const concatTask = require('./concatTask')
const curry = require('lodash/fp/curry')
const mapReducer = require('../lambda/mapReducer')
const Task = require('folktale/concurrency/task')
const transduce = require('../lambda/transduce')

/**
 * mapEntriesTask :: Transform -> Object -> Object
 *
 * Transform => (b -> a -> b)
 */
const mapEntriesTask = curry((transform, collection) =>
    transduce(mapReducer(transform), concatTask, Task.of({}), Object.entries(collection)))

module.exports = mapEntriesTask
