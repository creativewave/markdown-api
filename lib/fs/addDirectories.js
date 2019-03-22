
const addDirectory = require('./addDirectory')
const mapTask = require('../lambda/mapTask')

/**
 * addDirectories :: [Path] -> Task Error [Path]
 */
const addDirectories = (paths, options) => mapTask(path => addDirectory(path, options), paths)

module.exports = addDirectories
