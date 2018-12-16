
const addDirectory = require('../fs/addDirectory')
const setEntity = require('./setEntity')

/**
 * addEntity :: Entry -> Task Error Entry
 *
 * It should create `entry.dist` directory.
 * It should write `entry.entity` into `entry.distIndex`.
 *
 * TODO (feature: use `slug` for endpoint path): use `entry.entity.slug` instead
 * of `entry.dist` which uses `entry.name`.
 */
const addEntity = entry => addDirectory(entry.dist).chain(() => setEntity(entry)).map(() => entry)

module.exports = addEntity
