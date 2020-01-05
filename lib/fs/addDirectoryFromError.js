
const addDirectory = require('./addDirectory')
const path = require('path')
const Task = require('folktale/concurrency/task')

/**
 * addDirectoryFromError :: Error -> Task Error Path
 */
const addDirectoryFromError = error =>
    error.code === 'ENOENT'
        ? addDirectory(path.dirname(error.path))
            .orElse(addDirectoryFromError)
            .chain(() => addDirectory(error.path))
        : Task.rejected(error)

module.exports = addDirectoryFromError
