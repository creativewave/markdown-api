
const removeDirectory = require('../fs/removeDirectory')
const removeDist = require('./removeDist')
const removeFile = require('../fs/removeFile')
const removeStaticDir = require('./removeStaticDir')

/**
 * removeExcerpt :: Entry -> Task Error Path
 */
const removeExcerpt = entry => removeFile(entry.srcExcerpt)

/**
 * removeContent :: Entry -> Task Error Path
 */
const removeContent = entry => removeFile(entry.srcContent)

/**
 * removeIndex :: Entry -> Task Error Path
 */
const removeIndex = entry => removeFile(entry.srcIndex)

/**
 * removeEntry :: Entry -> Task Error Results
 */
const removeEntry = entry =>
    removeDirectory(entry.src, { recursive: true })
        .and(removeDist(entry)
        .and(removeStaticDir(entry)))

module.exports = Object.assign(removeEntry, { removeContent, removeExcerpt, removeIndex })
