
const removeFile = require('../fs/removeFile')

/**
 * removeEntity :: Entry -> Task Error Entry
 *
 * It should remove JSON entity endpoint from distribution directory.
 */
const removeEntity = entry => removeFile(entry.distIndex).map(() => entry)

module.exports = removeEntity
