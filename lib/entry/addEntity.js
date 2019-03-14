
const addFile = require('../fs/addFile')

/**
 * addEntity :: Entry -> Task Error Entry
 *
 * It should create a JSON entity endpoint in distribution directory.
 */
const addEntity = entry => addFile(entry.distIndex, JSON.stringify(entry.entity)).map(() => entry)

module.exports = addEntity
