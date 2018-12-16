
const getIndex = require('./getIndex')
const getContent = require('./getContent')
const getExcerpt = require('./getExcerpt')
const marked = require('../marked')
const Task = require('folktale/concurrency/task')

/**
 * getEntity :: Entry -> Task Error Entity
 */
const getEntity = ({ name, ...entry }) =>
    Task.of(index => content => excerpt => ({ content, excerpt, name, ...index }))
        .apply(getIndex(entry))
        .apply(getContent(entry).map(marked(entry.urlsPath)))
        .apply(getExcerpt(entry).map(marked(entry.urlsPath)))

module.exports = getEntity
