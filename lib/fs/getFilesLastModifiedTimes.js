
const getFileLastModifiedTime = require('./getFileLastModifiedTime')
const mapTask = require('../lambda/mapTask')

/**
 * getFilesLastModifiedTimes :: [Path] -> Task Error [Date]
 */
const getFilesLastModifiedTimes = mapTask(getFileLastModifiedTime)

module.exports = getFilesLastModifiedTimes
