/* eslint-disable no-useless-escape */
/**
 * How to write meaningfull tests of the `api build` command?
 *
 * 1. What should be tested?
 *    -> Failures (promise rejections)
 *    -> New/updated/removed files paths
 *    -> New/updated files contents
 * 2. Are files system IO allowed in tests?
 *    -> Yes, requiring the tested module is a file system IO anyway
 *    -> No, they could make them more brittle (see below)
 * 3. How to write tests without any files system IOs?
 *    -> By mocking `fs`, but it would be tightly coupled with internal impl.
 *    -> By splitting runtime in two phases:
 *       * a tested diffing phase with read-only IOs
 *       * an untested commiting phase with idiomatic write/remove IOs
 *
 * This is the diffing phase, with read-only IOs, that is tested.
 *
 * What is currently brittle in current tests?
 *
 * Last modified times of /fixtures/build files require specific relation (lte
 * or gte) to successfully run tests, as the tested code will read them. But Git
 * replaces those timestamps, eg. when checking out.
 * To solve this problem, `fixture/build/dist` is automatically copy/pasted in
 * place before running build tests (to recursively set a last modified time >
 * `fixture/build/src`) and each test case expecting an update on a specific
 * endpoint (entity, index, static file) should refresh the last modified time
 * of the corresponding source content file using `fs.setLastModifiedTime`.
 *
 * How to setup a new build test case?
 *
 * Each case should pick a directory in `fixtures/build/src/` to use as a source
 * entries directory, ie. a "source case".
 * Each case should pick or create its own directory in `fixtures/build/src/` to
 * use as a distribution directory, ie. a "dist case", containing the required
 * entities, indexes, cache, and static files.
 *
 */
const addFile = require('../lib/fs/addFile')
const assert = require('assert')
const build = require('../commands/build')
const copyDirectory = require('../lib/fs/copyDirectory')
const getEntry = require('../lib/entry/getEntry')
const getHash = require('../lib/string/getHash')
const { join } = require('path')
const map = require('../lib/lambda/map')
const mapTask = require('../lib/lambda/mapTask')
const mapValues = require('lodash/fp/mapValues')
const removeDirectory = require('../lib/fs/removeDirectory')
const removeFile = require('../lib/fs/removeFile')
const setLastModifiedTime = require('../lib/fs/setLastModifiedTime')

const fixturesPath = join(__dirname, 'fixtures', 'build')

/**
 * setOptions :: Options -> Options
 *
 * It sets default options by only requiring `options.src` and `options.dist`.
 */
const setOptions = ({
    dist,
    entitiesPerPage = 10,
    force = false,
    hash = false,
    src,
    type = 'posts',
    subVersion = false,
}) => ({
    dist: join(fixturesPath, 'dist', dist, 'api'),
    distIndexes: join(fixturesPath, 'dist', dist, 'api', 'categories', type),
    entitiesPerPage,
    force,
    hash,
    src: join(fixturesPath, 'src', src),
    subVersion,
    type,
})

/**
 * setEntries :: [EntryName] -> [Entries]
 *
 * It collects entries by using their names, and return them to assert against
 * them in `expectUpdate`.
 */
const setEntries = (expected, { dist, hash, src, type } = setOptions(expected.options)) =>
    mapValues(
        map(entry => {

            const normalizedEntry = getEntry(entry.name, { dist, src, type })
            const distIndex = join(normalizedEntry.dist, `index${hash ? `-${entry.entity.hash}` : ''}.json`)

            return { ...entry, ...normalizedEntry, distIndex }
        }),
        expected.entries)

/**
 * setExpected :: Update -> Update
 *
 * It sets default properties/values to given `Update` in order to preserve its
 * expected structure (and to write more declarative tests).
 */
const setExpected = ({ entries = {}, indexes = {}, options }) => ({
    entries: { add: [], remove: [], update: [], ...entries },
    indexes: { cache: {}, remove: [], write: {}, ...indexes },
    options: setOptions(options),
})

/**
 * expectUpdate :: Update -> Promise Error void
 *
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate }
 *
 * It asserts against expected `entries` and `indexes` to update.
 */
const expectUpdate = async (_expected, { options, ...expected } = setExpected(_expected)) => {
    process.env.NODE_ENV = 'test-with-errors' // Enable tasks errors logging from /lib/console/log.js
    return await build.getEndpointsUpdate(options)
        .map(actual => {
            assert.deepStrictEqual(actual.entries, expected.entries)
            assert.deepStrictEqual(actual.indexes.write, expected.indexes.write)
            assert.deepStrictEqual(actual.indexes.remove, expected.indexes.remove)
            assert.deepStrictEqual(actual.indexes.cache, expected.indexes.cache)
        })
        .run()
        .promise()
}

/**
 * expectRejects :: Options -> Promise Error void
 */
const expectRejects = async options => {
    process.env.NODE_ENV = 'test' // Disable tasks errors logging from /lib/console/log.js
    return await assert.rejects(build.getEndpointsUpdate(setOptions(options)).run().promise())
}


describe('build#getEndpointsUpdate()', () => {

    // Recursively set last modified time of the distribution directory
    // Remove .gitignore
    before((dist = join(fixturesPath, 'dist'), tmp = join(fixturesPath, 'tmp')) =>
        copyDirectory(dist, tmp, { exclude: ['.gitignore'], recursive: true })
            .and(removeFile(join(fixturesPath, 'src', 'empty', '.gitignore'))
            .and(removeFile(join(fixturesPath, 'src', 'empty-posts', 'posts', '.gitignore')))
            .and(removeFile(join(fixturesPath, 'src', 'missing-content', 'posts', 'entry', '.gitignore'))))
            .chain(() => removeDirectory(dist, { recursive: true }))
            .chain(() => copyDirectory(tmp, dist, { recursive: true }))
            .chain(() => removeDirectory(tmp, { recursive: true }))
            .run()
            .promise())

    // Recreate .gitignore to prevent git from removing empty folder
    after(() => mapTask(path => addFile(join(path, '.gitignore'), '!.gitignore'), [
        join(fixturesPath, 'dist', 'empty', 'api', 'categories', 'posts'),
        join(fixturesPath, 'dist', 'empty', 'api', 'posts'),
        join(fixturesPath, 'dist', 'empty', 'static', 'posts'),
        join(fixturesPath, 'dist', 'missing-entity', 'api', 'categories', 'posts'),
        join(fixturesPath, 'dist', 'missing-entity', 'api', 'posts', 'entry'),
        join(fixturesPath, 'dist', 'missing-static-dir', 'api', 'categories', 'posts'),
        join(fixturesPath, 'dist', 'missing-static-dir', 'static', 'posts'),
        join(fixturesPath, 'dist', 'without-cache-single', 'api', 'categories', 'posts'),
        join(fixturesPath, 'src', 'empty'),
        join(fixturesPath, 'src', 'empty-posts', 'posts'),
        join(fixturesPath, 'src', 'missing-content', 'posts', 'entry'),
    ]).run().promise())

    it('rejects task when source directory is missing', () =>
        expectRejects({ dist: 'empty', src: 'missing' }))

    it('rejects task when a source entry is missing a content file', () =>
        Promise.all([
            expectRejects({ dist: 'empty', src: 'missing-content' }), // New source
            expectRejects({ dist: 'without-cache-single', src: 'missing-content' }), // Updated source
        ]))

    it('rejects task when there is only a single entry to add which is a draft', () =>
        expectRejects({ dist: 'empty', src: 'single-draft' }))

    it('rejects task when there is no entry to add, update, or remove', () =>
        expectRejects({ dist: 'empty', src: 'empty' }))

    it('returns update for a single entry to add', () => {

        const options = { dist: 'empty', src: 'single' }
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { add: [entry] }, options })

        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        return expectUpdate({ entries, indexes: indexesUpdate, options })
    })

    it('returns update for a single entry to remove', () => {

        const options = { dist: 'without-cache-single', src: 'empty-posts' }
        const entry = { name: 'entry' }
        const entries = setEntries({ entries: { remove: [entry] }, options })

        return expectUpdate({ entries, options })
    })

    it('returns update for a single entry index to update', async () => {

        const options = { dist: 'without-cache-single', src: 'single-updated-index' }
        const entityIndex = {
            categories: ['test-updated-index'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { update: [entry] }, options })

        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, 'test-updated-index': pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        await setLastModifiedTime(entries.update[0].srcIndex).run().promise()

        return expectUpdate({ entries, indexes: indexesUpdate, options })
    })

    it('returns update for a single entry content to update', async () => {

        const options = { dist: 'without-cache-single', src: 'single-updated-content' }
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"updated-content\">Updated content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: false,
            hasStaticDirUpdate: false,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { update: [entry] }, options })

        await setLastModifiedTime(entries.update[0].srcContent).run().promise()

        return expectUpdate({ entries, options })

    })

    it('returns update for a single entry excerpt to update', async () => {

        const options = { dist: 'without-cache-single', src: 'single-updated-excerpt' }
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Updated excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: false,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { update: [entry] }, options })

        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        await setLastModifiedTime(entries.update[0].srcExcerpt).run().promise()

        return expectUpdate({ entries, indexes: indexesUpdate, options })
    })

    it('returns update for a single entry static dir to update', async () => {

        const options = { dist: 'without-cache-single', src: 'single-updated-static-dir' }
        const entry = {
            hasEntityUpdate: false,
            hasIndexUpdate: false,
            hasStaticDirUpdate: true,
            name: 'entry',
        }
        const entries = setEntries({ entries: { update: [entry] }, options })

        await setLastModifiedTime(join(entries.update[0].srcStatic, 'static.svg')).run().promise()

        return expectUpdate({ entries, options })

    })

    it('returns update for a single entry to add [with cache]', () => {

        const options = { dist: 'with-cache-multiple-add', src: 'multiple' }
        const beforeEntityIndex = {
            categories: ['test'],
            date: 19991231,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'before-entry',
            slug: 'before-entry',
            title: 'title',
        }
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const afterEntityIndex = {
            categories: ['test'],
            date: 20000102,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'after-entry',
            slug: 'after-entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { add: [entry] }, options })

        const pages = { 1: { entities: [beforeEntityIndex, entityIndex, afterEntityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        return expectUpdate({ entries, indexes: indexesUpdate, options })

    })

    it('returns update for a single entry to remove [with cache]', () => {

        const options = { dist: 'with-cache-multiple', src: 'multiple-remove' }
        const entry = { name: 'entry' }
        const beforeEntityIndex = {
            categories: ['test'],
            date: 19991231,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'before-entry',
            slug: 'before-entry',
            title: 'title',
        }
        const afterEntityIndex = {
            categories: ['test'],
            date: 20000102,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'after-entry',
            slug: 'after-entry',
            title: 'title',
        }
        const entries = setEntries({ entries: { remove: [entry] }, options })

        const pages = { 1: { entities: [beforeEntityIndex, afterEntityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        return expectUpdate({ entries, indexes: indexesUpdate, options })

    })

    it('returns update for a single entry index to update [with cache]', async () => {

        const options = { dist: 'with-cache-multiple', src: 'multiple-updated-index' }
        const beforeEntityIndex = {
            categories: ['test'],
            date: 19991231,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'before-entry',
            slug: 'before-entry',
            title: 'title',
        }
        const entityIndex = {
            categories: ['test-updated-index'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const afterEntityIndex = {
            categories: ['test'],
            date: 20000102,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'after-entry',
            slug: 'after-entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { update: [entry] }, options })

        const indexes = {
            all: { 1: { entities: [beforeEntityIndex, entityIndex, afterEntityIndex], next: '', prev: '' } },
            test: { 1: { entities: [beforeEntityIndex, afterEntityIndex], next: '', prev: '' } },
            'test-updated-index': { 1: { entities: [entityIndex], next: '', prev: '' } },
        }
        const indexesUpdate = { cache: indexes, options, write: indexes }

        await setLastModifiedTime(entries.update[0].srcIndex).run().promise()

        return expectUpdate({ entries, indexes: indexesUpdate, options })

    })

    // it('returns update for a single entry content to update [with cache]', async () => {

    // })

    // it('returns update for a single entry excerpt to update [with cache]', async () => {

    // })

    // it('returns update for a single entry static dir to update [with cache]', async () => {

    // })

    it('returns update for a single entry to add [with paginaton][with cache]', async () => {

        const options = { dist: 'with-pagination-with-cache', entitiesPerPage: 1, src: 'multiple' }
        const beforeEntityIndex = {
            categories: ['test'],
            date: 19991231,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'before-entry',
            slug: 'before-entry',
            title: 'title',
        }
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            slug: 'entry',
            title: 'title',
        }
        const afterEntityIndex = {
            categories: ['test'],
            date: 20000102,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'after-entry',
            slug: 'after-entry',
            title: 'title',
        }
        const entry = {
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { add: [entry] }, options })

        const pagesWrite = {
            2: { entities: [entityIndex], next: 'page/3/', prev: 'page/1/' },
            3: { entities: [afterEntityIndex], next: '', prev: 'page/2/' },
        }
        const pagesCache = {
            1: { entities: [beforeEntityIndex], next: 'page/2/', prev: '' },
            ...pagesWrite,
        }
        const write = { all: pagesWrite, test: pagesWrite }
        const cache = { all: pagesCache, test: pagesCache }
        const indexes = { cache, options, write }

        return expectUpdate({ entries, indexes, options })

    })

    it('returns update for a single entry to add [with hash]', () => {

        const options = { dist: 'empty', hash: true, src: 'single' }
        const content = '<h1 id=\"content\">Content</h1>\n'
        /* eslint-disable sort-keys */
        const entityIndex = {
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: 'entry',
            categories: ['test'],
            date: 20000101,
            slug: 'entry',
            title: 'title',
        }
        /* eslint-enable sort-keys */
        entityIndex.hash = getHash(JSON.stringify({ content, ...entityIndex }))

        const entity = { ...entityIndex, content }
        const entry = {
            entity,
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndex.name,
        }
        const entries = setEntries({ entries: { add: [entry] }, options })

        const pages = { 1: { entities: [entityIndex], hash: getHash(entityIndex.hash), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }
        const indexesUpdate = { cache: indexes, write: indexes }

        return expectUpdate({ entries, indexes: indexesUpdate, options })
    })

    // it('returns update for multiple entries to add [with hash]', async () => {

    // })
})
