
const addStaticDir = require('./addStaticDir')
const removeStaticDir = require('./removeStaticDir')

/**
 * setStaticDir :: Entry -> Task Error Entry
 */
const setStaticDir = entry => removeStaticDir(entry).chain(addStaticDir)

module.exports = setStaticDir
