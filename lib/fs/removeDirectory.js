
const compose = require('lodash/fp/compose')
const fs = require('fs')
const join = require('../path/getJoinedPath')
const getDirectoryFilesNames = require('./getDirectoryFilesNames')
const mapTask = require('../lambda/mapTask')
const Task = require('folktale/concurrency/task')

/**
 * removeDirectory :: Path -> Options? -> Task Error Path
 *
 * Options => { recursive: Boolean }
 *
 * Note: using `recursive: true ` has a performance cost.
 * Note: `remove` is required at runtime to avoid circular dependency.
 */
const removeDirectory = (dir, { recursive = false } = {}) =>
    recursive
        ? getDirectoryFilesNames(dir)
            .chain(mapTask(compose(require('./remove'), join(2, dir))))
            .chain(() => removeDirectory(dir))
        : Task.fromNodeback(fs.rmdir)(dir).map(() => dir)

module.exports = removeDirectory
