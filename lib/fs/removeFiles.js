
const removeFile = require('./removeFile')
const mapTask = require('../collection/mapTask')

/**
 * removeFiles :: [Path] -> Task Error [Path]
 */
const removeFiles = mapTask(removeFile)

module.exports = removeFiles
