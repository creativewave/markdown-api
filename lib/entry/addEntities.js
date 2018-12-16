
const addEntity = require('./addEntity')
const mapTask = require('../lambda/mapTask')

/**
 * addEntities :: [Entry] -> Task Error [Entity]
 */
const addEntities = mapTask(addEntity)

module.exports = addEntities
