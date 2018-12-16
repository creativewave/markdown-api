
const setEntity = require('./setEntity')
const mapTask = require('../lambda/mapTask')

/**
 * setEntities :: [Entry] -> Task Error [Entity]
 */
const setEntities = mapTask(setEntity)

module.exports = setEntities
