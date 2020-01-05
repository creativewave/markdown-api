
const getLastModifiedTime = require('./getLastModifiedTime')
const mapTask = require('../collection/mapTask')

/**
 * getLastModifiedTimes :: [Path] -> Task Error [Date]
 */
const getLastModifiedTimes = mapTask(getLastModifiedTime)

module.exports = getLastModifiedTimes
