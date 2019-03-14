
const addEntity = require('./addEntity')
const removeEntity = require('./removeEntity')

/**
 * setEntity :: Entry -> Task Error Entry
 */
const setEntity = entry => removeEntity(entry).chain(addEntity)

module.exports = setEntity
