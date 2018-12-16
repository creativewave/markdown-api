
const removeFile = require('../fs/removeFile')

/**
 * removeEntity :: Entry -> Task Error Entry
 */
const removeEntity = entry => removeFile(entry.distIndex).map(() => entry)

module.exports = removeEntity
