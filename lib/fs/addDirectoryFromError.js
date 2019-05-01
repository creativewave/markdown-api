
const addDirectory = require('./addDirectory')
const Task = require('folktale/concurrency/task')

/**
 * addDirectoryFromError :: Error -> Task Error Path
 */
const addDirectoryFromError = error =>
    error.code === 'ENOENT' ? addDirectory(error.path) : Task.rejected(error)

module.exports = addDirectoryFromError
