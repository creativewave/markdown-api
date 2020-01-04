
const getEntry = require('./getEntry')

/**
 * getEntries ::[EntryName] -> Configuration -> [Entry]
 */
const getEntries = (names, config) => names.map(name => getEntry(name, config))

module.exports = getEntries
