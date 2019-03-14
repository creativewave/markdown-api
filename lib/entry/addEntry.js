
const addDirectory = require('../fs/addDirectory')
const addFile = require('../fs/addFile')
const logReject = require('../console/logReject')
const stringify = require('../stringify')

/**
 * addExcerpt :: Entry -> Task Error String
 *
 * It should create entry `excerpt.md`.
 */
const addExcerpt = ({ srcExcerpt, entity: { excerpt } }) =>
    addFile(srcExcerpt, excerpt).map(() => excerpt)

/**
 * addContent :: Entry -> Task Error String
 *
 * It should create entry `content.md`.
 */
const addContent = ({ srcContent, entity: { content } }) =>
    addFile(srcContent, content).map(() => content)

/**
 * addIndex :: Entry -> Task Error Index
 *
 * It should create entry `index.js`.
 */
const addIndex = ({ srcIndex, entity: { content, excerpt, ...index } }) => // eslint-disable-line no-unused-vars
    addFile(srcIndex, `\nmodule.exports = ${stringify(index)}`).map(() => index)

/**
 * addEntry :: Entry -> Task Error Results
 *
 * It should create entry source directory.
 * It should create entry source static directory.
 * It should create entry source files.
 */
const addEntry = entry =>
    addDirectory(entry.src)
        .orElse(logReject('There was an error while creating entry directory'))
        .chain(() => addIndex(entry).and(addContent(entry).and(addExcerpt(entry).and(addDirectory(entry.srcStatic))))
            .orElse(logReject('There was an error while creating entry files')))

module.exports = Object.assign(addEntry, { addContent, addExcerpt, addIndex })
