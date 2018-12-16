
const fs = require('fs')
const path = require('path')
const Task = require('folktale/concurrency/task')

/**
 * addDirectory :: Path -> Task Error Path
 */
const addDirectory = (dir, mode = 0o755) =>
    Task.fromNodeback(fs.mkdir)(dir, mode)
        .orElse(error => {
            switch (error.code) {
                case 'ENOENT':
                    return addDirectory(path.dirname(dir)).chain(() => addDirectory(dir))
                case 'EEXIST':
                    return Task.of(dir)
                default:
                    return Task.rejected(error)
            }
        })
        .map(() => dir)

module.exports = addDirectory
