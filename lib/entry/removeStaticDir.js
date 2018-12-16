
const removeDirectory = require('../fs/removeDirectory')

/**
 * removeStaticDir :: Entry -> Task Error Entry
 */
const removeStaticDir = entry => removeDirectory(entry.distStatic, { recursive: true }).map(() => entry)

module.exports = removeStaticDir
