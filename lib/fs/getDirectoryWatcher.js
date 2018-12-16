
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryWatcher :: Path -> Task Error void
 */
const getDirectoryWatcher = (dir, { recursive = true } = {}) =>
    Task.fromNodeback(fs.watch)(dir, { recursive })

module.exports = getDirectoryWatcher
