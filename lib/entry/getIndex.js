
const safeRequire = require('../module/require')
const Task = require('folktale/concurrency/task')

/**
 * getIndex :: Entry -> Task Error EntryIndex
 */
const getIndex = entry => safeRequire(entry.srcIndex).map(Task.of).getOrElse(Task.rejected())

module.exports = getIndex
