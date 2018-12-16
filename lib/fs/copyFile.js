
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * copyFile :: Path -> Path -> Task Error Path
 */
const copyFile = (src, dest) => Task.fromNodeback(fs.copyFile)(src, dest).map(() => src)

module.exports = copyFile
