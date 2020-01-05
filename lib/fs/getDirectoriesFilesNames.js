
const getDirectoryFilesNames = require('./getDirectoryFilesNames')
const mapTask = require('../collection/mapTask')

/**
 * getDirectoriesFilesNames :: [Path] -> Task Error [[String]]
 */
const getDirectoriesFilesNames = mapTask(getDirectoryFilesNames)

module.exports = getDirectoriesFilesNames
