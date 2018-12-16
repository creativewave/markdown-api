
const removeStaticDir = require('./removeStaticDir')
const mapTask = require('../lambda/mapTask')

/**
 * removeStaticDirs :: [Entry] -> Task Error [Entry]
 */
const removeStaticDirs = mapTask(removeStaticDir)

module.exports = removeStaticDirs
