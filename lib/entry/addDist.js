
const addDirectory = require('../fs/addDirectory')

/**
 * addDist :: Entry -> Task Error Entry
 *
 * It should create entry distribution directory.
 *
 * TODO (feature: use `slug` for endpoint path): use `entry.entity.slug` instead
 * of `entry.dist` which uses `entry.name`.
 */
const addDist = entry => addDirectory(entry.dist).map(() => entry)

module.exports = addDist
