
const removeDirectory = require('../fs/removeDirectory')

/**
 * removeDist :: Entry -> Task Error Entry
 */
const removeDist = entry => removeDirectory(entry.dist, { recursive: true }).map(() => entry)

module.exports = removeDist
