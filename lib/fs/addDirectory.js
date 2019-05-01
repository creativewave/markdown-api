
const fs = require('fs')
const Task = require('folktale/concurrency/task')
const removeDirectory = require('./removeDirectory')

/**
 * addDirectory :: Path -> Options? -> Task Error Path
 *
 * Options => { mode: Number, override: Boolean, recursive: Boolean }
 *
 * Note: it will not produce an error if directory already exists.
 * Note: using `override: true` will recursively remove the directory if it
 * already exists, before creating a new one.
 * Note: it will not produce an error if a parent directory doesn't exist, and
 * it will create it (as with mkdir -p).
 */
const addDirectory = (dir, { mode = 0o755, override = false, recursive = true } = {}) =>
    Task.fromNodeback(fs.mkdir)(dir, { mode, recursive })
        .orElse(error => {
            if (error.code === 'EEXIST') {
                if (override) {
                    return removeDirectory(dir, { recursive: true }).chain(addDirectory)
                }
                return Task.of(dir)
            }
            return Task.rejected(error)
        })
        .map(() => dir)

module.exports = addDirectory
