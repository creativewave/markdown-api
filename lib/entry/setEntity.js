
const addFile = require('../fs/addFile')

/**
 * setEntity :: Entry -> Task Error Entry
 */
const setEntity = entry => addFile(entry.distIndex, JSON.stringify(entry.entity)).map(() => entry)

module.exports = setEntity
