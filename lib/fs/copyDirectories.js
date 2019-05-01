
const copyDirectory = require('./copyDirectory')
const mapTask = require('../lambda/mapTask')

/**
 * copyDirectories :: [Path] -> Path -> Options? -> Task Error [Path]
 *
 * Note: `exclude` can contain names (not paths) to not copy.
 * Note: using `recursive: true` has a performance cost.
 */
const copyDirectories = (dirs, dest, { exclude, recursive = false } = {}) =>
    mapTask(dir => copyDirectory(dir, dest, { exclude, recursive }), dirs)

module.exports = copyDirectories
