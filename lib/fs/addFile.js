
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * addFile :: Path -> String -> Task Error Path
 */
const addFile = (file, data, { mode = 0o644 } = {}) =>
    Task.fromNodeback(fs.writeFile)(file, data, { mode }).map(() => file)

module.exports = addFile
