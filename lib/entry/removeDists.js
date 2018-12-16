
const removeDist = require('./removeDist')
const mapTask = require('../lambda/mapTask')

/**
 * removeDists :: [Entry] -> Task Error [Entry]
 */
const removeDists = mapTask(removeDist)

module.exports = removeDists
