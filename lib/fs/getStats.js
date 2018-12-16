
const getStat = require('./getStat')
const mapTask = require('../lambda/mapTask')

/**
 * getStats :: [Path] -> Task Error [Stat]
 */
const getStats = mapTask(getStat)

module.exports = getStats
