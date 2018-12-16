
const getEntity = require('./getEntity')
const mapTask = require('../lambda/mapTask')

/**
 * getEntities :: [Entry] -> Task Error [Entity]
 */
const getEntities = mapTask(getEntity)

module.exports = getEntities
