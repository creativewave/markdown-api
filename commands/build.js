
const addDirectory = require('../lib/fs/addDirectory')
const addDirectoryFromError = require('../lib/fs/addDirectoryFromError')
const addDist = require('../lib/entry/addDist')
const addEntities = require('../lib/entry/addEntities')
const addEntity = require('../lib/entry/addEntity')
const addFile = require('../lib/fs/addFile')
const addStaticDirs = require('../lib/entry/addStaticDirs')
const capitalize = require('lodash/fp/capitalize')
const categorize = require('../lib/categorize')
const compose = require('lodash/fp/compose')
const difference = require('lodash/fp/difference')
const every = require('lodash/fp/every')
const filterReducer = require('../lib/collection/filterReducer')
const find = require('lodash/fp/find')
const flatten = require('lodash/fp/flatten')
const getDirectoriesFilesNames = require('../lib/fs/getDirectoriesFilesNames')
const getDirectoryFilesNames = require('../lib/fs/getDirectoryFilesNames')
const getEntity = require('../lib/entry/getEntity')
const getEntries = require('../lib/entry/getEntries')
const getHash = require('../lib/string/getHash')
const getUpdatedEntries = require('../lib/entry/getUpdatedEntries')
const into = require('../lib/collection/into')
const isEmpty = require('lodash/fp/isEmpty')
const join = require('../lib/path/getJoinedPath')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const map = require('../lib/collection/map')
const mapTask = require('../lib/collection/mapTask')
const mapValues = require('lodash/fp/mapValues')
const Maybe = require('folktale/maybe')
const merge = require('lodash/fp/merge')
const paginate = require('../lib/paginate')
const prop = require('lodash/fp/prop')
const removeDirectories = require('../lib/fs/removeDirectories')
const removeDists = require('../lib/entry/removeDists')
const removeStaticDirs = require('../lib/entry/removeStaticDirs')
const Result = require('folktale/result')
const safeProp = require('../lib/collection/safeProp')
const safeRequire = require('../lib/module/require')
const setHash = require('../lib/entry/setHash')
const sortBy = require('lodash/fp/sortBy')
const setEntities = require('../lib/entry/setEntities')
const setStaticDirs = require('../lib/entry/setStaticDirs')
const setVersion = require('../lib/entry/setVersion')
const Task = require('folktale/concurrency/task')

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
 * setIndexesEndpoints :: IndexesUpdate -> Configuration -> Manifest -> Task Error IndexesResults
 *
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 * Configuration => {
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
 * setEntitiesEndpoints :: EntriesUpdate -> Configuration -> Task Error EntitiesResults
 *
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 * Configuration => {
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
 *   config: Configuration,
 *   entries: EntriesUpdate,
 *   indexes: IndexesUpdate,
 *   manifest: Manifest,
 * }
 * Result => { entities: EntitiesResults, indexes: IndexesResults }
 * EntitiesResults => {
 *   add: Number,
 *   remove: Number,
 *   update: Number,
 *   staticDirs: Number,
 * }
 * IndexesResults => { write: Number, remove: Number }
 *
 * It should run the file system operations described in the given `Update` to
 * build endpoints from the corresponding resource type.
 */
const setEndpoints = ({ entries, indexes, manifest, config }) =>
    Task.of(entities => indexes => () => ({ entities, indexes }))
        .apply(setEntitiesEndpoints(entries, config).map(mapValues('length')))
        .apply(setIndexesEndpoints(indexes, config, config.hash ? Maybe.Just(manifest) : Maybe.Nothing()).map(mapValues('length')))
        .apply(config.hash ? addManifestEndpoint(manifest, config) : Task.of({}))

/**
 * getManifestUpdate :: Update -> Update
 *
 * Update => { config: Configuration, entries: EntriesUpdate, indexes: IndexesUpdate, manifest: Manifest }
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
 * Update => { config: Configuration, entries: EntriesUpdate, indexes: IndexesUpdate }
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 * Pages => { [Page]: Index }
 * Index => { entities: [EntityIndex], hash?: Number, prev: Path, next: Path }
 *
 * Iterating over each `EntityIndex` to check if it should be (re)moved, while
 * also handling pagination, is too hard and slow. Instead, each `IndexName`
 * (category) get its `EntityIndex`es:
 *  > (1) flattened (without pagination)
 *  > (2) sliced from the oldest entity after the oldest to write or remove
 *  > (3) filtered from entities to remove
 *  > (4) merged with entities to write
 *  > (5) sorted
 *  > (6) paginated
 *  > (7) and diffed/merged against initial cached indexes
 */
const reduceIndexes = write => (update, [category, pages]) => {

    // (1) Get flattened `EntityIndex`es (entities for short)
    const entities = Object.values(pages).flatMap(prop('entities'))
    // TODO: implement and check if the following works
    // Single iteration using toArray, ie. transduce(objectTransducer, push, [], arrayOfObjects):
    // const entities = toArray(mapReducer(prop('entities')), Object.values(pages))

    // Get indexes (numbers) of the first entity to write and remove (or -1 if any)
    const firstEntityIndex = {
        remove: entities.findIndex(entity =>
            // Does it have an entity whose its source entry has been removed?
            update.entries.remove.find(remove => remove.name === entity.name)
            // Or does it have an entity only removed from this category?
            || ('all' !== category && safeProp('all', write)
                .map(find(next => next.name === entity.name && !next.categories.includes(category)))
                .getOrElse(false))),
        write: safeProp(category, write).chain(safeProp(0))
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
    const firstPage = Math.ceil(firstEntityIndexUpdate / update.config.entitiesPerPage)
    let nextEntities = entities.slice((firstPage - 1) * update.config.entitiesPerPage)

    // (3) Filter removed entities
    if (-1 < firstEntityIndex.remove) {
        nextEntities = nextEntities.filter(entity =>
            update.entries.remove.every(remove => remove.name !== entity.name)
            && ('all' === category || safeProp('all', write)
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
        update.indexes.remove.push(join(update.config.distIndexes, category))
        delete update.indexes.cache[category]
        return update
    }

    // (5) Re-order
    nextEntities = sortBy('date', nextEntities)

    // (6) Paginate
    let nextPages = paginate(nextEntities, { limit: update.config.entitiesPerPage, offset: firstPage })
    const previousPages = into({}, filterReducer(([page]) => page < firstPage), pages)
    const nextCache = { ...previousPages, ...nextPages }
    // Get previous pages indexes paths whose number is greater than the new pages count
    const remove = difference(Object.keys(pages), Object.keys(nextCache))
        .map(page => join(update.config.distIndexes, category, page))

    // (7) Diff `nextPages` against `cache` (previous pages) to remove untouched pages
    // TODO: use `safeProp` to read pages[page].entities[idx].name and write[category]
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
 * getIndexesCache :: Configuration -> Result Error Indexes
 *
 * Configuration => {
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
 */
const getIndexesCache = ({ distIndexes, force }) => force
    ? Result.of({})
    : safeRequire(join(distIndexes, 'cache.json'))

/**
 * getIndexesToWrite :: Update -> { IndexName: [EntityIndex] }
 *
 * Update => { config: Configuration, entries: EntriesUpdate, indexes: IndexesUpdate }
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 * Entry => { ...Entry, Entity }
 *
 * It should filter out `Update.entries.remove`.
 * It should filter in `Update.entries.update` with `.hasIndexUpdate` or if
 * `Update.config.force`.
 */
const getIndexesToWrite = update =>
    categorize(sortBy('date', Object.entries(update.entries).reduce(
        (indexes, [op, entries]) => {
            if ('remove' === op) {
                return indexes
            }
            if ('add' === op || update.config.force) {
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
 * Update => { config: Configuration, entries: EntriesUpdate, indexes: IndexesUpdate }
 * IndexesUpdate => { cache: Indexes, remove: [Path], write: Indexes }
 * Indexes => { [IndexName]: Pages }
 *
 * It should assign an `IndexesUpdate` to `Update` that describes indexes to
 * write (excerpt contents) and remove (only paths), as well as a flat (cache)
 * version that will used to detect index changes of the next build.
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
 * TODO(refactoring): transduce write into update with indexes.
 */
const getIndexesUpdate = (update, write = getIndexesToWrite(update)) =>
    Object.keys(write).reduce(
        (update, category) => {
            if (!update.indexes.cache[category]) {
                update.indexes.cache[category] = paginate(
                    write[category],
                    {
                        hash: update.config.hash,
                        limit: update.config.entitiesPerPage,
                    },
                )
                update.indexes.write[category] = update.indexes.cache[category]
            }
            return update
        },
        getIndexesCache(update.config)
            .map(cache => reduceIndexesUpdate(update, cache, write))
            .getOrElse({ ...update, indexes: { cache: {}, remove: [], write: {} } }))

/**
 * getEntriesUpdate :: Configuration -> Task Error Update
 *
 * Configuration => {
 *   dist: Path,
 *   distIndexes: Path,
 *   entitiesPerPage: Number,
 *   force: Boolean,
 *   hash: Boolean,
 *   src: Path,
 *   subVersion: Boolean,
 *   type: EntityType,
 * }
 * Update => { config: Configuration, entries: EntriesUpdate }
 * EntriesUpdate => { add: [Entry], remove: [Entry], update: [Entry] }
 *
 * TODO(feature: use `slug` for endpoint path): think if this feature should be
 * removed or not, as each source entry `index.js` would need to be read to get
 * its `slug` and if different than its directory name, diff it against entries
 * names from the distribution directory.
 *
 * TODO(refactoring): transduce entries names into update with entries update.
 */
const getEntriesUpdate = config =>
    getDirectoriesFilesNames([join(config.src, config.type), join(config.dist, config.type)])
        .orElse(error => addDirectoryFromError(error)
            .chain(() => getDirectoriesFilesNames([join(config.src, config.type), join(config.dist, config.type)])))
        .orElse(logReject(`There was an error while reading '${config.type}' entries`))
        .map(([src, dist], add = difference(src, dist)) => ({
            add: getEntries(add, config).map(entry => ({ ...entry, hasEntityUpdate: true, hasIndexUpdate: true })),
            old: getEntries(difference(src, add), config),
            remove: getEntries(difference(dist, src), config),
        }))
        .chain(({ add, old, remove }) => config.force
            ? Task.of({
                add,
                remove,
                update: old.map(entry => ({
                    ...entry,
                    hasEntityUpdate: true,
                    hasIndexUpdate: true,
                    hasStaticDirUpdate: true,
                })),
            })
            : getUpdatedEntries(old, config)
                .map(update => ({ add, remove, update }))
                .orElse(logReject(`There was an error while getting updated '${config.type}'`)))
        .chain(mapTask(([op, entries]) => {
            if (op === 'remove') {
                return Task.of([op, entries])
            }
            return entries.reduce(
                (task, entry) => (entry.hasIndexUpdate || entry.hasEntityUpdate)
                    ? task.and(getEntity(entry)).map(([[op, entries], entity]) => {
                        if (entity.draft) {
                            return [op, entries]
                        }
                        if (config.hash) {
                            if (config.version) {
                                return [op, entries.concat(setVersion(setHash({ ...entry, entity })))]
                            }
                            return [op, entries.concat(setHash({ ...entry, entity }))]
                        }
                        return [op, entries.concat({ ...entry, entity })]
                    })
                    : Task.of([op, entries]),
                Task.of([op, []])).orElse(logReject(`There was an error while getting '${config.type}' entities`))
        }))
        .chain(entries => isEmpty(Object.values(entries).flat())
            ? Task.rejected(log('info', `There was no '${config.type}' to build`))
            : Task.of({ config, entries }))

/**
 * getEndpointsUpdate :: Configuration -> Task Error Update
 *
 * Configuration => {
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
 *   config: Configuration,
 *   entries: EntriesUpdate,
 *   indexes: IndexesUpdate,
 *   manifest: Manifest,
 * }
 *
 * It should return an `Update` that describes file system operations that have
 * to be run to build endpoints from the corresponding resource type:
 * - a collection of entries to add/remove/update
 * - a collection of indexes to remove/write (as well as a flat/cached version)
 * - the configuration to build those endpoints
 */
const getEndpointsUpdate = compose(
    map(update => update.config.hash ? getManifestUpdate(update) : update),
    map(getIndexesUpdate),
    getEntriesUpdate)

/**
 * build :: Configuration -> Task Error Results
 *
 * Configuration => {
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
 */
const build = config =>
    getDirectoryFilesNames(config.src)
        .orElse(logReject(`There was an error while reading sources directory from '${config.src}'`))
        .chain(types => isEmpty(types)
            ? Task.rejected(log('error', `There was no sources found in ${config.src}`))
            : Task.of(types))
        .chain(types => types.reduce(
            (build, type) => build
                .and(getEndpointsUpdate({ ...config, distIndexes: join(config.dist, 'categories', type), type })
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
