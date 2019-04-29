
const addDirectory = require('../lib/fs/addDirectory')
const addDist = require('../lib/entry/addDist')
const addEntities = require('../lib/entry/addEntities')
const addEntity = require('../lib/entry/addEntity')
const addFile = require('../lib/fs/addFile')
const addStaticDirs = require('../lib/entry/addStaticDirs')
const capitalize = require('lodash/fp/capitalize')
const categorize = require('../lib/categorize')
const compose = require('lodash/fp/compose')
const concat = require('../lib/collection/concat')
const difference = require('lodash/fp/difference')
const every = require('lodash/fp/every')
const filterReducer = require('../lib/lambda/filterReducer')
const find = require('lodash/fp/find')
const flatten = require('lodash/fp/flatten')
const getDirectoriesFilesNames = require('../lib/fs/getDirectoriesFilesNames')
const getDirectoryFilesNames = require('../lib/fs/getDirectoryFilesNames')
const getEntity = require('../lib/entry/getEntity')
const getEntries = require('../lib/entry/getEntries')
const getHash = require('../lib/string/getHash')
const getProp = require('../lib/collection/getProp')
const getUpdatedEntries = require('../lib/entry/getUpdatedEntries')
const isEmpty = require('lodash/fp/isEmpty')
const join = require('../lib/path/getJoinedPath')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const map = require('../lib/lambda/map')
const mapEntriesTask = require('../lib/collection/mapEntriesTask')
const mapTask = require('../lib/lambda/mapTask')
const mapValues = require('lodash/fp/mapValues')
const Maybe = require('folktale/maybe')
const merge = require('lodash/fp/merge')
const paginate = require('../lib/paginate')
const prop = require('lodash/fp/prop')
const removeDirectories = require('../lib/fs/removeDirectories')
const removeDists = require('../lib/entry/removeDists')
const removeStaticDirs = require('../lib/entry/removeStaticDirs')
const Result = require('folktale/result')
const safeRequire = require('../lib/module/require')
const setHash = require('../lib/entry/setHash')
const sortBy = require('lodash/fp/sortBy')
const setEntities = require('../lib/entry/setEntities')
const setStaticDirs = require('../lib/entry/setStaticDirs')
const setVersion = require('../lib/entry/setVersion')
const Task = require('folktale/concurrency/task')
const transduce = require('../lib/lambda/transduce')

/**
 * setManifestEndpoint :: Manifest -> Task Error Path
 */
const addManifestEndpoint = (manifest, { distIndexes }) =>
    addFile(join(distIndexes, 'manifest.json'), JSON.stringify(manifest))
        .orElse(logReject('There was an error while trying to write manifest'))

/**
 * addCategoriesIndex :: Path -> CategoriesIndex -> Task Error Path
 */
const addCategoriesIndex = (dir, index, hash) =>
    addFile(join(dir, hash.map(hash => `index-${hash}.json`).getOrElse('index.json')), JSON.stringify(index))
        .orElse(logReject('There was an error while trying to write categories index'))

/**
 * addEntitiesIndex :: Path -> Index -> String -> Boolean -> Task Error Path
 */
const addEntitiesIndex = (dir, index, hash, subVersion) =>
    addDirectory(dir, { override: !subVersion })
        .chain(() => addFile(join(dir, hash.map(hash => `index-${hash}.json`).getOrElse('index.json')), JSON.stringify(index)))

/**
 * addEntitiesIndexes :: Path -> Indexes -> IndexManifest -> Boolean -> Task Error [[Path]]
 *
 * Indexes => { [IndexName]: Pages }
 * Pages   => { [Page]: Index }
 * IndexManifest => { [IndexName]: { [Page]: String } }
 */
const addEntitiesIndexes = (dir, indexes, manifest, subVersion) =>
    mapTask(([category, pages]) =>
        mapTask(([page, index]) =>
            addEntitiesIndex(join(dir, category, page), index, manifest.map(prop(category)).map(prop(page)), subVersion),
        Object.entries(pages))
        .orElse(logReject(`There was an error while trying to write indexes of category '${category}'`)),
    Object.entries(indexes))

/**
 * setIndexesEndpoints :: IndexesUpdate -> Options -> Manifest -> Task Error IndexesResults
 *
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 * Options => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * Manifest => {
 *   categories: String,
 *   entities: EntityManifest,
 *   indexes: IndexManifest,
 * }
 * IndexesResults => { remove: [Path], write: [Path] }
 */
const setIndexesEndpoints = ({ cache, remove, write }, { distIndexes, subVersion }, manifest) =>
    isEmpty(remove) && isEmpty(write)
        ? Task.of({ remove: [], write: [] })
        : Task.of(write => remove => () => () => ({ remove, write }))
            .apply(addEntitiesIndexes(distIndexes, write, manifest.map(prop('indexes')), subVersion).map(flatten))
            .apply(removeDirectories(remove))
            .apply(addCategoriesIndex(
                distIndexes,
                Object.keys(cache).reduce((categories, category) => ({
                    ...categories,
                    [category]: 'all' === category ? 'All' : capitalize(category),
                }), {}),
                manifest.map(prop('categories'))))
            .apply(addFile(join(distIndexes, 'cache.json'), JSON.stringify(cache)))

/**
 * setEntitiesEndpoints :: EntriesUpdate -> Options -> Task Error EntitiesResults
 *
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 * Options => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * EntitiesResults => {
 *   add: [Entry],
 *   remove: [Entry],
 *   update: [Entry],
 *   staticDirs: [Entry]
 * }
 */
const setEntitiesEndpoints = ({ add, remove, update }, { hash, subVersion }) =>
    Task.of(([add]) => ([remove]) => update => staticDirs => ({ add, remove, staticDirs, update }))
        .apply(mapTask(entry => addDist(entry).chain(addEntity), add).and(addStaticDirs(add)))
        .apply(removeDists(remove).and(removeStaticDirs(remove)))
        .apply((hash && subVersion ? addEntities : setEntities)(update.filter(prop('hasEntityUpdate'))))
        .apply(setStaticDirs(update.filter(prop('hasStaticDirUpdate'))))
        .orElse(logReject('There was an error while trying to write entities'))

/**
 * setEndpoints :: Update -> Task Error Result
 *
 * Update => {
 *   entries: EntriesUpdate,
 *   indexes: IndexesUpdate,
 *   Options,
 *   Manifest,
 * }
 * Result => { entities: EntitiesResults, indexes: IndexesResults }
 * EntitiesResults => {
 *   add: Number,
 *   remove: Number,
 *   update: Number,
 *   staticDirs: Number,
 * }
 * IndexesResults => { write: Number, remove: Number }
 */
const setEndpoints = ({ entries, indexes, manifest, options }) =>
    Task.of(entities => indexes => () => ({ entities, indexes }))
        .apply(setEntitiesEndpoints(entries, options).map(mapValues('length')))
        .apply(setIndexesEndpoints(indexes, options, options.hash ? Maybe.Just(manifest) : Maybe.Nothing()).map(mapValues('length')))
        .apply(options.hash ? addManifestEndpoint(manifest, options) : Task.of({}))

/**
 * getManifestUpdate :: Update -> Update
 *
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate, Manifest, Options }
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 * Pages => { [Page]: Index }
 * Index => { hash: String, entities: [EntityIndex], prev: Path, next: Path }
 * Manifest => {
 *   categories: String,
 *   entities: EntityManifest,
 *   indexes: IndexManifest,
 * }
 * EntityManifest => { [EntryName]: String }
 * IndexManifest => { [IndexName]: { [Page]: String } }
 *
 * It should collect `Index.hash`es.
 * It should collect `EntityIndex.hash`es.
 */
const getManifestUpdate = update => ({
    ...update,
    manifest: {
        categories: Object.keys(update.indexes.cache.all).reduce((hash, category) => `${hash}${getHash(category)}`, ''),
        entities: Object.values(update.indexes.cache.all).reduce(
            (manifest, pages) => Object.values(pages).reduce(
                (manifest, { hash, name }) => merge({ [name]: hash }, manifest),
                manifest),
            {}),
        indexes: Object.entries(update.indexes.cache).reduce(
            (manifest, [category, pages]) => Object.entries(pages).reduce(
                (manifest, [page, { hash }]) => merge({ [category]: { [page]: hash } }, manifest),
                { ...manifest, [category]: {} }),
            {}),
    },
})

/**
 * reduceIndexes :: { [IndexName]: [EntityIndex] } -> Update -> [IndexName, { Page: Index }] -> Update
 *
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate, Options }
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 * Pages => { [Page]: Index }
 * Index => { entities: [EntityIndex], hash?: Number, prev: Path, next: Path }
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
    let nextPages = paginate(nextEntities, { limit: update.options.entitiesPerPage, offset: firstPage })
    const previousPages = transduce(filterReducer(([page]) => page < firstPage), concat, {}, Object.entries(pages))
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
 * Options => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * Indexes => { [IndexName]: Pages }
 * Pages => { [Page]: Index }
 * Index => { entities: [EntityIndex], hash?: String, prev: Path, next: Path }
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
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate, Options }
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 * Entry => { ...Entry, Entity }
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
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate, Options }
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
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
                update.indexes.cache[category] = paginate(
                    write[category],
                    {
                        hash: update.options.hash,
                        limit: update.options.entitiesPerPage,
                    }
                )
                update.indexes.write[category] = update.indexes.cache[category]
            }
            return update
        },
        getIndexesCache(update.options)
            .map(cache => reduceIndexesUpdate(update, cache, write))
            .getOrElse({ ...update, indexes: { cache: {}, remove: [], write: {} } }))

/**
 * getEntriesUpdate :: Options -> Task Error Update
 *
 * Options => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * Update => { entries: EntriesUpdate, Options }
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
            add: getEntries(add, options).map(entry => ({ ...entry, hasEntityUpdate: true, hasIndexUpdate: true })),
            old: getEntries(difference(src, add), options),
            remove: getEntries(difference(dist, src), options),
        }))
        .chain(({ add, old, remove }) => Task.of(update => ({ add, remove, update }))
            .apply(options.force
                ? Task.of(old.map(entry => ({ ...entry, hasEntityUpdate: true, hasIndexUpdate: true, hasStaticDirUpdate: true })))
                : getUpdatedEntries(old, options))
            .orElse(logReject(`There was an error while getting updated '${options.type}'`)))
        .chain(entries => Object.entries(entries).reduce(
            (task, [op, entries]) => task
                .and(['add', 'update'].includes(op)
                    ? entries.reduce(
                        (task, entry) => entry.hasIndexUpdate || entry.hasEntityUpdate
                            ? task.and(getEntity(entry)).map(([entries, entity]) => {
                                if (entity.draft) {
                                    return entries
                                }
                                if (options.hash) {
                                    if (options.version) {
                                        return [...entries, setVersion(setHash({ ...entry, entity }))]
                                    }
                                    return [...entries, setHash({ ...entry, entity })]
                                }
                                return [...entries, { ...entry, entity }]
                            })
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
 * Options => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * Update => {
 *   entries: EntriesUpdate,
 *   indexes: IndexesUpdate,
 *   Manifest,
 *   Options,
 * }
 */
const getEndpointsUpdate = compose(
    map(update => update.options.hash ? getManifestUpdate(update) : update),
    map(getIndexesUpdate),
    getEntriesUpdate)

/**
 * build :: Options -> Task Error Results
 *
 * Options => {
 *   dist: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 * }
 * Results => { [EntityType]: Result }
 *
 * It builds API endpoints:
 *
 * 1. Entities
 *    - Add endpoints (new resources)
 *    - Update endpoints (modified resources)
 *    - Remove endpoints (removed resources)
 * 2. Indexes
 *    - Add/update/remove endpoints (based from 1)
 * 3. (Optional) Manifest
 *    - Add manifest (based from indexes cache in 2)
 *
 * Terminology:
 * - endpoint: a file in the distribution directory
 * - entity: the full contents of a resource (source entry)
 * - entity index: the partial contents used to describe a resource in indexes
 * - entity static files: the external contents of a resource
 * - entry: an object used as a unit of state of an entity existing either in
 *   the source or in the distribution directory
 * - indexes: a tree of paginated lists of entities indexes
 * - manifest: a tree of endpoints mapped to their hash
 */
const build = options =>
    getDirectoryFilesNames(options.src).chain(types => types.reduce(
        (build, type) => build
            .and(getEndpointsUpdate({ ...options, distIndexes: join(options.dist, 'categories', type), type })
                .chain(setEndpoints)
                .orElse(() => Task.of())) // Nothing to build
                .map(([results, result]) => result ? { ...results, [type]: result } : results),
        Task.of({})))

module.exports = Object.assign(
    build, {
        // Testable units:
        getEndpointsUpdate,
        // Testable sub units:
        getEntriesUpdate,
        getIndexesUpdate,
        getManifestUpdate,
    },
)
