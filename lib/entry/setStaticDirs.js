
const mapTask = require('../lambda/mapTask')
const setStaticDir = require('./setStaticDir')

/**
 * setEntities :: [Entry] -> Task Error [Entity]
 */
const setStaticDirs = mapTask(setStaticDir)

module.exports = setStaticDirs
