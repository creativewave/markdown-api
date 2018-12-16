
const addDirectory = require('./addDirectory')
const mapTask = require('../lambda/mapTask')

/**
 * addDirectories :: [Path] -> Task Error [Path]
 */
const addDirectories = mapTask(addDirectory)

module.exports = addDirectories
