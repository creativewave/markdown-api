
const getEntry = require('./getEntry')

/**
 * getEntries ::[EntryName] ->  Options -> [Entry]
 */
const getEntries = (names, options) => names.map(name => getEntry(name, options))

module.exports = getEntries
