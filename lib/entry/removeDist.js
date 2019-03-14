
const removeDirectory = require('../fs/removeDirectory')

/**
 * removeDist :: Entry -> Task Error Entry
 *
 * It should remove entry distribution directory.
 */
const removeDist = entry => removeDirectory(entry.dist, { recursive: true }).map(() => entry)

module.exports = removeDist
