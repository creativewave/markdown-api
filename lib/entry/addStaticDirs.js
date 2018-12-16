
const addStaticDir = require('./addStaticDir')
const mapTask = require('../lambda/mapTask')

/**
 * addStaticDirs :: [Entry] -> Task Error [Entity]
 */
const addStaticDirs = mapTask(addStaticDir)

module.exports = addStaticDirs
