
const addDist = require('./addDist')
const mapTask = require('../lambda/mapTask')

/**
 * addDists :: [Entry] -> Task Error [Entity]
 */
const addDists = mapTask(addDist)

module.exports = addDists
