
const curry = require('lodash/fp/curry')
const getEntry = require('./getEntry')

/**
 * getEntries :: Path -> Path -> Type -> [EntryName] -> [Entry]
 */
const getEntries = curry((src, dist, type, names) =>
    names.map(name => getEntry(src, dist, type, name)))

module.exports = getEntries
