
const addDirectory = require('./addDirectory')
const mapTask = require('../collection/mapTask')

/**
 * addDirectories :: [Path] -> Options? -> Task Error [Path]
 */
const addDirectories = (paths, options) => mapTask(path => addDirectory(path, options), paths)

module.exports = addDirectories
