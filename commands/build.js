
const addDirectory = require('../lib/fs/addDirectory')
const addEntities = require('../lib/entry/addEntities')
const addFile = require('../lib/fs/addFile')
const addStaticDirs = require('../lib/entry/addStaticDirs')
const assign = require('lodash/fp/assign')
const capitalize = require('lodash/fp/capitalize')
const categorize = require('../lib/categorize')
const compact = require('lodash/fp/compact')
const compose = require('lodash/fp/compose')
const difference = require('lodash/fp/difference')
const every = require('lodash/fp/every')
const filterReducer = require('../lib/lambda/filterReducer')
const find = require('lodash/fp/find')
const flatten = require('lodash/fp/flatten')
const getDirectoriesFilesNames = require('../lib/fs/getDirectoriesFilesNames')
const getDirectoryFilesNames = require('../lib/fs/getDirectoryFilesNames')
const getEntity = require('../lib/entry/getEntity')
const getEntries = require('../lib/entry/getEntries')
const getProp = require('../lib/collection/getProp')
const getUpdatedEntries = require('../lib/entry/getUpdatedEntries')
const isEmpty = require('lodash/fp/isEmpty')
const join = require('../lib/path/getJoinedPath')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const map = require('../lib/lambda/map')
const mapTask = require('../lib/lambda/mapTask')
const mapValues = require('lodash/fp/mapValues')
const paginate = require('../lib/paginate')
const prop = require('lodash/fp/prop')
const removeDirectories = require('../lib/fs/removeDirectories')
const removeDists = require('../lib/entry/removeDists')
const removeEntities = require('../lib/entry/removeEntities')
const removeStaticDirs = require('../lib/entry/removeStaticDirs')
const Result = require('folktale/result')
const safeRequire = require('../lib/module/require')
const sortBy = require('lodash/fp/sortBy')
const setEntities = require('../lib/entry/setEntities')
const setProp = require('../lib/collection/setProp')
const Task = require('folktale/concurrency/task')
const transduce = require('../lib/lambda/transduce')

/**
 * addCategoriesIndex :: Path -> CategoriesIndex -> Task Error Path
 *
 * CategoriesIndex => { [IndexName]: IndexTitle }
 */
const addCategoriesIndex = (dir, index) =>
    addFile(join(dir, 'index.json'), JSON.stringify(index))
        .orElse(logReject('There was an error while trying to write categories index'))

/**
 * addEntitiesIndex :: Path -> Index -> Task Error Path
 *
 * Index => { entities: [EntityIndex], next: Path, prev: Path }
 */
const addEntitiesIndex = (dir, index) =>
    addDirectory(dir).chain(() => addFile(join(dir, 'index.json'), JSON.stringify(index)))

/**
 * addEntitiesIndexes :: Path -> Indexes -> Task Error [[Path]]
 *
 * Indexes => { [IndexName]: Pages }
 * Pages   => { [Page]: Index }
 */
const addEntitiesIndexes = (dir, indexes) =>
    mapTask(([category, pages]) =>
        mapTask(([page, index]) =>
            addEntitiesIndex(join(dir, category, page), index),
        Object.entries(pages))
        .orElse(logReject(`There was an error while trying to write indexes for category '${category}'`)),
    Object.entries(indexes))

/**
 * addIndexes :: Path -> Indexes -> Indexes -> [[Path]]
 *
 * Indexes => { [IndexName]: Pages }
 */
const addIndexes = (path, entities, cache) =>
    addEntitiesIndexes(path, entities)
        .and(addCategoriesIndex(path, Object.keys(cache).reduce((categories, category) =>
            assign({ [category]: 'all' === category ? 'Tous les articles' : capitalize(category) }, categories), {})))

/**
 * setIndexesEndpoints :: Path -> IndexesUpdate -> Task Error IndexesResults
 *
 * IndexesUpdate  => { cache: Indexes, write: Indexes, remove: [Path] }
 * IndexesResults => { write: [Path], remove: [Path] }
 */
const setIndexesEndpoints = (path, { cache, remove, write }) =>
    isEmpty(remove) && isEmpty(write)
        ? Task.of({ remove: [], write: [] })
        : Task.of(write => remove => () => ({ remove, write }))
            .apply(addIndexes(path, write, cache).map(flatten))
            .apply(removeDirectories(remove))
            .apply(addFile(join(path, 'cache.json'), JSON.stringify(cache)))

/**
 * setEntitiesEndpoints :: EntriesUpdate -> Task Error EntitiesResults
 *
 * EntriesUpdate   => { add: [Entry], remove: [Entry], update: [Entry] }
 * EntitiesResults => { add: [Entry], remove: [Entry], update: [Entry], staticDirs: [Entry] }
 */
const setEntitiesEndpoints = ({ add, remove, update }) =>
    Task.of(([add]) => ([remove]) => update => staticDirs => ({ add, remove, staticDirs, update }))
        .apply(addEntities(add).and(addStaticDirs(add)))
        .apply(removeDists(remove).and(removeStaticDirs(remove)))
        .apply(removeEntities(update.filter(prop('hasEntityUpdate'))).chain(setEntities))
        .apply(removeStaticDirs(update.filter(prop('hasStaticDirUpdate'))).chain(addStaticDirs))
        .orElse(logReject('There was an error while trying to write entities'))

/**
 * setEndpoints :: Update -> Task Error Result
 *
 * Update          => { Options, entries: EntriesUpdate, indexes: IndexesUpdate }
 * Result          => { entities: EntitiesResults, indexes: IndexesResults, type: EntryType }
 * EntitiesResults => { add: Number, remove: Number, update: Number, staticDirs: Number }
 * IndexesResults  => { write: Number, remove: Number }
 */
const setEndpoints = update =>
    setEntitiesEndpoints(update.entries).and(setIndexesEndpoints(update.options.distIndexes, update.indexes))
        .map(map(mapValues(prop('length'))))
        .map(([entities, indexes]) => ({ entities, indexes, type: update.options.type }))

/**
 * reduceIndexes :: { [IndexName]: [EntityIndex] } -> Update -> [IndexName, { Page: Index }] -> Update
 *
 * Update        => { options: OptionsUpdate, entries: EntriesUpdate, indexes: IndexesUpdate }
 * IndexesUpdate => { cache: Indexes, write: Indexes, remove: [Path] }
 * Indexes       => { [IndexName]: Pages }
 * Pages         => { [Page]: Index }
 * Index         => { entities: [EntityIndex], prev: Path, next: Path }
 *
 * It is too hard and slow to iterate over each `EntityIndex`, check if it needs
 * to be removed, or if another `EntityIndex` should be writed before, handle
 * pagination, etc...
 *
 * Instead, each `IndexName` (category) get its `EntityIndex`es handled:
 *  > (1) flat (without pagination)
 *  > (2) sliced from the oldest entity after the oldest to write or remove
 *  > (3) filtered from entities to remove
 *  > (4) merged with entities to write
 *  > (5) sorted
 *  > (6) paginated
 *  > (7) and diffed/merged against initial cached indexes
 */
const reduceIndexes = write => (update, [category, pages]) => {

    // (1) Get flattened `EntityIndex`es (entities for short)
    const entities = flatten(Object.values(pages).map(prop('entities')))
    // TODO: implement and check if the following works
    // Single iteration using toArray, ie. transduce(objectTransducer, push, [], arrayOfObjects):
    // const entities = toArray(mapReducer(prop('entities')), Object.values(pages))

    // Get indexes (numbers) of the first entity to write and remove (or -1 if any)
    const firstEntityIndex = {
        remove: entities.findIndex(entity =>
            // Does it have an entity whose its source entry has been removed?
            update.entries.remove.find(remove => remove.name === entity.name)
            // Or does it have an entity only removed from this category?
            || ('all' !== category && getProp('all', write)
                .map(find(next => next.name === entity.name && !next.categories.includes(category)))
                .getOrElse(false))),
        write: getProp(category, write).chain(getProp(0))
            .map(first => entities.findIndex(entity => entity.date > first.date || entity.name === first.name))
            .getOrElse(-1),
    }

    // Go to next iteration (category) if nothing has changed
    if (-1 === firstEntityIndex.write && -1 === firstEntityIndex.remove) {
        update.indexes.cache[category] = pages
        return update
    }

    // (2) Get entities slice from the first to write/remove
    const firstEntityIndexUpdate = -1 < firstEntityIndex.write || -1 < firstEntityIndex.remove
        ? -1 < firstEntityIndex.write ? firstEntityIndex.write : firstEntityIndex.remove
        : Math.min(firstEntityIndex.write, firstEntityIndex.remove)
    const firstPage = Math.ceil(firstEntityIndexUpdate / update.options.entitiesPerPage)
    let nextEntities = entities.slice((firstPage - 1) * update.options.entitiesPerPage)

    // (3) Filter removed entities
    if (-1 < firstEntityIndex.remove) {
        nextEntities = nextEntities.filter(entity =>
            update.entries.remove.every(remove => remove.name !== entity.name)
            && ('all' === category || getProp('all', write)
                .map(every(next => next.name !== entity.name || next.categories.includes(category)))
                .getOrElse(true)))
    }
    // (4) Write entities
    if (-1 < firstEntityIndex.write) {
        nextEntities = [
            ...nextEntities.filter(entity => write[category].find(({ name }) => name !== entity.name)),
            ...write[category],
        ]
    }

    // Remove category if it has no more entries after (3) and (4).
    if (0 === nextEntities.length) {
        update.indexes.remove.push(join(update.options.distIndexes, category))
        delete update.indexes.cache[category]
        return update
    }

    // (5) Re-order
    nextEntities = sortBy('date', nextEntities)

    // (6) Paginate
    let nextPages = paginate(nextEntities, update.options.entitiesPerPage, firstPage)
    const previousPages = transduce(filterReducer(([page]) => page < firstPage), setProp, {}, Object.entries(pages))
    const nextCache = { ...previousPages, ...nextPages }
    // Get previous pages indexes paths whose number is greater than the new pages count
    const remove = difference(Object.keys(pages), Object.keys(nextCache))
        .map(page => join(update.options.distIndexes, category, page))

    // (7) Diff `nextPages` against `cache` (previous pages) to remove untouched pages
    // TODO: use `getProp` to read pages[page].entities[idx].name and write[category]
    // TODO: try to abstract a curried `isStaleEntityIndex` receiving cache and write Maybes
    nextPages = Object.entries(nextPages).reduce(
        (finalNextPages, [page, index]) =>
            index.entities.find((entity, idx) =>
                // Does entities have been introduced/moved inside or removed from the current page?
                (!pages[page] || pages[page].entities[idx].name !== entity.name)
                // ...or does entities have been updated inside the current page?
                || (write[category] && write[category].find(({ name }) => name === entity.name)))
                // > If it is a stale page, rewrite it (filter it in the final pages to write).
                ? { ...finalNextPages, [page]: index }
                // > Else don't (filter it out from the final pages to write).
                : finalNextPages,
        {})

    update.indexes.write[category] = nextPages
    update.indexes.cache[category] = nextCache
    update.indexes.remove.push(...remove)

    return update
}

const reduceIndexesUpdate = (update, cache, write) =>
    Object.entries(cache).reduce(reduceIndexes(write), { ...update, indexes: { cache: {}, remove: [], write: {} } })

/**
 * getIndexesCache :: Options -> Result Error Indexes
 *
 * Options => { entitiesPerPage: Number, force: Boolean, dist: Path, src: Path }
 * Indexes => { [IndexName]: Pages }
 * Pages   => { [Page]: Index }
 * Index   => { entities: [EntityIndex], prev: Path, next: Path }
 *
 * TODO (fix missing indexes directory): it should return a rejected task and
 * log an error when `/dist/api/categories` is missing, or ideally, it should
 * recover from the error returned by `safeRequire` by creating this directory
 * and returning an empty cache, ie. `.orElse(recoverError)`.
 */
const getIndexesCache = ({ distIndexes, force }) =>
    force ? Result.of({}) : safeRequire(join(distIndexes, 'cache.json'))

/**
 * getIndexesToWrite :: Update -> { IndexName: [EntityIndex] }
 *
 * Update        => { Options, entries: EntriesUpdate, indexes: IndexesUpdate }
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 * Entry         => { ...Entry, Entity }
 *
 * It should filter out `Update.entries.remove`.
 * It should filter in `Update.entries.update` with `.hasIndexUpdate` or if
 * `Update.options.force`.
 */
const getIndexesToWrite = update =>
    categorize(sortBy('date', Object.entries(update.entries).reduce(
        (indexes, [op, entries]) => {
            if ('remove' === op) {
                return indexes
            }
            if ('add' === op || update.options.force) {
                return [
                    ...indexes,
                    // eslint-disable-next-line no-unused-vars
                    ...entries.reduce((indexes, { entity: { content, ...index } }) => [...indexes, index], []),
                ]
            }
            return [
                ...indexes,
                ...entries.reduce(
                    // eslint-disable-next-line no-unused-vars
                    (indexes, { entity: { content, ...index } = {}, hasIndexUpdate }) =>
                        hasIndexUpdate ? [...indexes, index] : indexes,
                    []),
            ]
        },
        [])))

/**
 * getIndexesUpdate :: Update -> Update
 *
 * Update        => { Options, entries: EntriesUpdate, indexes: IndexesUpdate }
 * IndexesUpdate => { cache: Indexes, write: Indexes, remove: [Path] }
 * Indexes       => { [IndexName]: Pages }
 * Pages         => { [Page]: Index }
 * Index         => { entities: [EntityIndex], prev: Path, next: Path }
 *
 * If not empty, it should reduce a cached indexes tree and set:
 * - `update.indexes.cache`  with the next indexes tree
 * - `update.indexes.write`  with parts of the next indexes tree to write
 * - `update.indexes.remove` with previous indexes paths to remove
 * If empty, it should set:
 * - `update.indexes.cache`  with `update.indexes.write`
 * - `update.indexes.write`  with paginated `write` indexes
 *
 * Memo: indexes are updated when an entry is added, updated, or removed.
 * Memo: a single file caching the indexes tree is reduced to avoid reading each
 * `Index` (file) of each `Page` of each `IndexName`.
 *
 * TODO (refactoring): transduce write into update with indexes.
 */
const getIndexesUpdate = (update, write = getIndexesToWrite(update)) =>
    Object.keys(write).reduce(
        (update, category) => {
            if (!update.indexes.cache[category]) {
                update.indexes.cache[category] = paginate(write[category], update.options.entitiesPerPage)
                update.indexes.write[category] = update.indexes.cache[category]
            }
            return update
        },
        getIndexesCache(update.options)
            .map(cache => reduceIndexesUpdate(update, cache, write))
            .getOrElse(assign({ indexes: { cache: {}, remove: [], write: {} } }, update)))

/**
 * getEntriesUpdate :: Options -> Task Error Update
 *
 * Options       => { entitiesPerPage: Number, force: Boolean, dist: Path, src: Path }
 * Update        => { Options, entries: EntriesUpdate }
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 *
 * TODO (feature: use `slug` for endpoint path): think if this feature should be
 * removed or not, as each source entry `index.js` would need to be read to get
 * its `slug` and if different than its directory name, diff it against entries
 * names from the distribution directory.
 *
 * TODO (refactoring): transduce entries names into update with entries update.
 */
const getEntriesUpdate = options =>
    getDirectoriesFilesNames([join(options.src, options.type), join(options.dist, options.type)])
        .orElse(logReject(`There was an error while reading '${options.type}'`))
        .map(([src, dist], add = difference(src, dist)) => ({
            add: getEntries(options.src, options.dist, options.type, add).map(assign({ hasEntityUpdate: true, hasIndexUpdate: true })),
            old: getEntries(options.src, options.dist, options.type, difference(src, add)),
            remove: getEntries(options.src, options.dist, options.type, difference(dist, src)),
        }))
        .chain(({ add, old, remove }) => Task.of(update => ({ add, remove, update }))
            .apply(options.force
                ? Task.of(old.map(assign({ hasEntityUpdate: true, hasIndexUpdate: true, hasStaticDirUpdate: true })))
                : getUpdatedEntries(old))
            .orElse(logReject(`There was an error while getting updated '${options.type}'`)))
        .chain(entries => Object.entries(entries).reduce(
            (task, [op, entries]) => task
                .and(['add', 'update'].includes(op)
                    ? entries.reduce(
                        (task, entry) => entry.hasIndexUpdate || entry.hasEntityUpdate
                            ? task.and(getEntity(entry)).map(([entries, entity]) =>
                                entity.draft ? entries : [...entries, { ...entry, entity }])
                            : Task.of(entries),
                        Task.of([]))
                    : Task.of(entries))
                .map(([entries, opEntries]) => ({ ...entries, [op]: opEntries })),
            Task.of({}).orElse(logReject(`There was an error while getting '${options.type}' entities`))))
        .chain(entries => isEmpty(flatten(Object.values(entries)))
            ? Task.rejected(log('info', `There was no '${options.type}' to build`))
            : Task.of(entries))
        .map(entries => ({ entries, options }))

/**
 * getEndpointsUpdate :: Options -> Task Error Update
 *
 * Options => { entitiesPerPage: Number, force: Boolean, dist: Path, src: Path }
 * Update  => { Options, entries: EntriesUpdate, indexes: IndexesUpdate }
 */
const getEndpointsUpdate = compose(map(getIndexesUpdate), getEntriesUpdate)

/**
 * build :: Options -> Task Error [Result]
 *
 * Options         => { entitiesPerPage: Number, force: Boolean, dist: Path, src: Path }
 * Result          => { entities: EntitiesResults, indexes: IndexesResults, type: EntryType }
 * EntitiesResults => { add: Number, remove: Number, update: Number, staticDirs: Number }
 * IndexesResults  => { write: Number, remove: Number }
 *
 * It builds API endpoints:
 *
 * 1. Entities
 *    - Add endpoints (new resources)
 *    - Update endpoints (modified resources)
 *    - Remove endpoints (removed resources)
 * 2. Indexes
 *    - Add/update/remove endpoints (based from 1)
 *
 * Terminology:
 * - endpoint: a file in the distribution directory
 * - entity: the full contents of a resource (source entry)
 * - entity index: the partial contents used to describe a resource in indexes
 * - entity static files: the external contents of a resource
 * - entry: an object used as a unit of state of an entity existing either in
 *   the source or in the distribution directory
 * - indexes: a tree of paginated lists of entities indexes
 */
const build = options =>
    getDirectoryFilesNames(options.src)
        .chain(mapTask(type =>
            getEndpointsUpdate({ ...options, distIndexes: join(options.dist, 'categories', type), type })
                .chain(setEndpoints)
                .orElse(() => Task.of())))
            .map(compact)

module.exports = Object.assign(
    build,
    // Testable units:
    { getEndpointsUpdate, getEntriesUpdate, getIndexesUpdate },
)
