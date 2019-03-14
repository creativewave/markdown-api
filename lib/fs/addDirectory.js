
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * addDirectory :: Path -> Task Error Path
 *
 * Note: it will not produce an error if directory already exists.
 * Note: it will not produce an error if a parent directory doesn't exist, and
 * it will create it (as with mkdir -p).
 */
const addDirectory = (dir, { mode = 0o755, recursive = true } = {}) =>
    Task.fromNodeback(fs.mkdir)(dir, { mode, recursive })
        .orElse(error => error.code === 'EEXIST' ? Task.of(dir) : Task.rejected(error))
        .map(() => dir)

module.exports = addDirectory
