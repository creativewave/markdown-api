
const getFile = require('./getFile')
const mapTask = require('../collection/mapTask')

/**
 * getFiles :: [Path] -> Task Error [String]
 */
const getFiles = mapTask(getFile)

module.exports = getFiles
