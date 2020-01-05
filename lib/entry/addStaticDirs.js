
const addStaticDir = require('./addStaticDir')
const mapTask = require('../collection/mapTask')

/**
 * addStaticDirs :: [Entry] -> Task Error [Entity]
 */
const addStaticDirs = mapTask(addStaticDir)

module.exports = addStaticDirs
