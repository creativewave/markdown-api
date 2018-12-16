
const addDirectory = require('../fs/addDirectory')
const addFile = require('../fs/addFile')
const logReject = require('../console/logReject')
const stringify = require('../stringify')

/**
 * addExcerpt :: Entry -> Task Error String
 */
const addExcerpt = ({ srcExcerpt, entity: { excerpt } }) =>
    addFile(srcExcerpt, excerpt).map(() => excerpt)

/**
 * addContent :: Entry -> Task Error String
 */
const addContent = ({ srcContent, entity: { content } }) =>
    addFile(srcContent, content).map(() => content)

/**
 * addIndex :: Entry -> Task Error Index
 */
const addIndex = ({ srcIndex, entity: { content, excerpt, ...index } }) => // eslint-disable-line no-unused-vars
    addFile(srcIndex, `\nmodule.exports = ${stringify(index)}`).map(() => index)

/**
 * addEntry :: Entry -> Task Error Results
 */
const addEntry = entry =>
    addDirectory(entry.src)
        .orElse(logReject('There was an error while creating entry directory'))
        .chain(() => addIndex(entry).and(addContent(entry).and(addExcerpt(entry).and(addDirectory(entry.srcStatic))))
            .orElse(logReject('There was an error while creating entry files')))

module.exports = Object.assign(addEntry, { addContent, addExcerpt, addIndex })
