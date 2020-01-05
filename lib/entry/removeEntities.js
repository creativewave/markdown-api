
const removeEntity = require('./removeEntity')
const mapTask = require('../collection/mapTask')

/**
 * removeEntities :: [Entry] -> Task Error [Entity]
 */
const removeEntities = mapTask(removeEntity)

module.exports = removeEntities
