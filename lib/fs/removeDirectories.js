
const mapTask = require('../lambda/mapTask')
const removeDirectory = require('./removeDirectory')

/**
 * removeDirectories :: [String] -> Options? -> Task Error [String]
 *
 * Note: using `recursive: true` has a performance cost.
 */
const removeDirectories = (dirs, { recursive = false } = {}) =>
    mapTask(dir => removeDirectory(dir, { recursive }), dirs)

module.exports = removeDirectories
