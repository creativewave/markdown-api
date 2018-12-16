
const getDirectoryFilesNames = require('./getDirectoryFilesNames')
const getStats = require('./getStats')
const join = require('../path/getJoinedPath')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryFilesStats :: Path -> Task Error [Stat]
 *
 * Note: it will return an empty array if directory is empty.
 */
const getDirectoryFilesStats = dir =>
    getDirectoryFilesNames(dir)
        .chain(names => 0 < names.length
            ? getStats(names.map(name => join(dir, name)))
            : Task.of([]))

module.exports = getDirectoryFilesStats
