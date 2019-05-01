
const addDirectory = require('./addDirectory')
const fs = require('fs')
const Task = require('folktale/concurrency/task')
const path = require('path')

/**
 * addFile :: Path -> String -> Options -> Task Error Path
 *
 * Note: it will not produce an error if a parent directory doesn't exist, and
 * it will create it (as with mkdir -p).
 */
const addFile = (file, data, { mode = 0o644, recursive = true } = {}) =>
    Task.fromNodeback(fs.writeFile)(file, data, { mode })
        .map(() => file)
        .orElse(error => {
            if (recursive && error.code === 'ENOENT') {
                return addDirectory(path.dirname(file)).map(() => addFile(file, data))
            }
            return Task.rejected(error)
        })

module.exports = addFile
