
const { addContent, addExcerpt, addIndex } = require('./addEntry')
const { removeContent, removeExcerpt, removeIndex } = require('./removeEntry')
const getIndex = require('./getIndex')
const Task = require('folktale/concurrency/task')

/**
 * setExcerpt :: Entry -> Task Error Boolean
 */
const setExcerpt = entry =>
    entry.entity.excerpt
        ? removeExcerpt(entry).chain(() => addExcerpt(entry))
        : Task.of(false)

/**
 * setContent :: Entry -> Task Error Boolean
 */
const setContent = entry =>
    entry.entity.content
        ? removeContent(entry).chain(() => addContent(entry))
        : Task.of(false)

/**
 * setIndex :: Entry -> Task Error Boolean
 */
const setIndex = ({ entity, ...entry }) =>
    entity.categories || entity.date || entity.title
        ? getIndex(entry)
            .chain(oldIndex => removeIndex(entry)
                .chain(() => addIndex({ ...entry, entity: { ...oldIndex, ...entity } })))
        : Task.of(false)

/**
 * setEntry :: Configuration -> Task Error (Maybe Result)
 */
const setEntry = entry =>
    Task.of(index => content => excerpt => ({ content, excerpt, index }))
        .apply(setIndex(entry))
        .apply(setContent(entry))
        .apply(setExcerpt(entry))

module.exports = Object.assign(setEntry, { setContent, setExcerpt, setIndex })
