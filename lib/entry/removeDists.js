
const removeDist = require('./removeDist')
const mapTask = require('../collection/mapTask')

/**
 * removeDists :: [Entry] -> Task Error [Entry]
 */
const removeDists = mapTask(removeDist)

module.exports = removeDists
