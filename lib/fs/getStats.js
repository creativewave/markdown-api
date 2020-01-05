
const getStat = require('./getStat')
const mapTask = require('../collection/mapTask')

/**
 * getStats :: [Path] -> Task Error [Stat]
 */
const getStats = mapTask(getStat)

module.exports = getStats
