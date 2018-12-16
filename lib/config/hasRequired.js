
const has = require('lodash/fp/has')
const Task = require('folktale/concurrency/task')

/**
 * hasRequired :: {a: b} -> a -> Task Error {a: b}
 */
const hasRequired = (config, param) => has(param, config)
    ? Task.of(config)
    : Task.rejected(`--${param} is required`)

module.exports = hasRequired
