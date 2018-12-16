
const getFile = require('./getFile')
const mapTask = require('../lambda/mapTask')

/**
 * getFiles :: [Path] -> Task Error [String]
 */
const getFiles = mapTask(getFile)

module.exports = getFiles
