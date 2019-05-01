
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryWatcher :: Path -> Options? -> Task Error void
 *
 * Options => { recursive: Boolean }
 */
const getDirectoryWatcher = (dir, { recursive = true } = {}) =>
    Task.fromNodeback(fs.watch)(dir, { recursive })

module.exports = getDirectoryWatcher
