
const mapTask = require('../lambda/mapTask')
const setEntity = require('./setEntity')

/**
 * setEntities :: [Entry] -> Task Error [Entity]
 */
const setEntities = mapTask(setEntity)

module.exports = setEntities
