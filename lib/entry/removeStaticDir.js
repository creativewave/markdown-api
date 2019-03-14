
const removeDirectory = require('../fs/removeDirectory')

/**
 * removeStaticDir :: Entry -> Task Error Entry
 *
 * It should remove entry static files distribution directory.
 */
const removeStaticDir = entry => removeDirectory(entry.distStatic, { recursive: true }).map(() => entry)

module.exports = removeStaticDir
