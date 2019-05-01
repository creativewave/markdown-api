
const addDirectory = require('./addDirectory')
const mapTask = require('../lambda/mapTask')

/**
 * addDirectories :: [Path] -> Options? -> Task Error [Path]
 */
const addDirectories = (paths, options) => mapTask(path => addDirectory(path, options), paths)

module.exports = addDirectories
