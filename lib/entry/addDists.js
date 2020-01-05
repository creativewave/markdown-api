
const addDist = require('./addDist')
const mapTask = require('../collection/mapTask')

/**
 * addDists :: [Entry] -> Task Error [Entity]
 */
const addDists = mapTask(addDist)

module.exports = addDists
