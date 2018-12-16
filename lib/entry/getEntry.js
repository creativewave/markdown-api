
const join = require('../path/getJoinedPath')

/**
 * getEntry :: Path -> Path -> Type -> EntryName -> Entry
 *
 * TODO (refactoring): search the ideal data structure for good readability in
 * tests and for good performances, ie. between simple object, simple object
 * with getters, or a class with getters.
 */
const getEntry = (src, dist, type, name) => ({
    dist:       join(dist, type, name),
    distIndex:  join(dist, type, name, 'index.json'),
    distStatic: join(dist, '..', 'static', type, name),
    name,
    src:        join(src, type, name),
    srcContent: join(src, type, name, 'content.md'),
    srcExcerpt: join(src, type, name, 'excerpt.md'),
    srcIndex:   join(src, type, name, 'index.js'),
    srcStatic:  join(src, type, name, 'static'),
    urlsPath:   `/static/${type}/${name}`,
})

module.exports = getEntry
