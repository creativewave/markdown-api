
const getFile = require('../fs/getFile')

/**
 * getExcerpt :: Entry -> Task Error EntryExcerpt
 */
const getExcerpt = entry => getFile(entry.srcExcerpt)

module.exports = getExcerpt
