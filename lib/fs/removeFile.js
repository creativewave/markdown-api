
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * removeFile :: Path -> Task Error Path
 */
const removeFile = file => Task.fromNodeback(fs.unlink)(file).map(() => file)

module.exports = removeFile
