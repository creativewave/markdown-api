
const curry = require('lodash/fp/curry')
const log = require('./log')
const Task = require('folktale/concurrency/task')

/**
 * logReject :: String -> Error -> Task Error
 */
const logReject = curry((message, error) => Task.rejected(log('error', `${message}\n`, error)))

module.exports = logReject
