
const removeFile = require('./removeFile')
const mapTask = require('../lambda/mapTask')

/**
 * removeFiles :: [Path] -> Task Error [Path]
 */
const removeFiles = mapTask(removeFile)

module.exports = removeFiles
