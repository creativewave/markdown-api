
const getFile = require('../fs/getFile')

/**
 * getContent :: Entry -> Task Error EntryContent
 */
const getContent = entry => getFile(entry.srcContent)

module.exports = getContent
