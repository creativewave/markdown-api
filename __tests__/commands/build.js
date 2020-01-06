/* eslint-disable no-useless-escape */
/**
 * How to write meaningfull tests of the `api build` command?
 *
 * 1. What should be tested?
 *    -> Failures (promise rejections)
 *    -> New/updated/removed files paths and contents
 * 2. Are files system IO allowed in tests?
 *    -> Yes, requiring the tested module is a file system IO anyway
 *    -> No, they could make them more brittle (see below)
 * 3. How to write tests without any files system IOs?
 *    -> by mocking `fs`, but it would be tightly coupled with internal impl.
 *    -> by splitting runtime in two phases:
 *       * tested: a diffing phase with read-only IOs*
 *       * untested: a commiting phase with idiomatic write/remove IOs
 *
 * *: the only exception is the creation of a missing distribution directory of
 * an entry type, eg. 'dist/api/posts/', which is mocked further below.
 */

const { join, sep } = require('path')
const fs = require('fs')
const getEntry = require('../../lib/entry/getEntry')
const getHash = require('../../lib/string/getHash')
const Result = require('folktale/result')

/**
 * expectUpdate :: Update -> Promise Error void
 *
 * Update => { entries: EntriesUpdate, indexes: IndexesUpdate }
 *
 * It should help asserting against expected `EntriesUpdate` and `IndexesUpdate`
 * by merging them in a default value.
 */
const expectUpdate = ({ entries = {}, indexes = {}, config }) => {
    const expected = {
        entries: { add: [], remove: [], update: [], ...entries },
        indexes: { cache: {}, remove: [], write: {}, ...indexes },
    }
    return build.getEndpointsUpdate(config)
        .map(actual => {
            expect(actual.entries).toEqual(expected.entries)
            expect(actual.indexes.write).toEqual(expected.indexes.write)
            expect(actual.indexes.remove).toEqual(expected.indexes.remove)
            expect(actual.indexes.cache).toEqual(expected.indexes.cache)
        })
        .run()
        .promise()
}

/**
 * fsIO :: Interface -> Implementation
 *
 * Implementation => (Path -> Options|Callback -> Callback?) -> a
 *
 * It should return an implementation to mock the given `Interface` of `fs` or
 * `/lib/module/require`.
 */
const fsIO = type => (path, options, callback = options) => {

    const pathParts = path.split(sep)

    try {

        const output = pathParts.reduce((dir, file) => dir[file], fileSystem)

        switch (type) {
            case 'mkdir':
                return callback(null)
            case 'readFile':
                return callback(null, output.content)
            case 'readdir':
                return callback(null, Object.keys(output))
            case 'require':
                return Result.Ok(output.content)
            case 'stat':
                return callback(null, output.stat)
            default:
                throw Error(`Could not find an implementation for ${type}`)
        }
    } catch {

        // Create directory in fileSystem (mkdir -p /parent/dir/does/not/exist)
        if (type === 'mkdir' && options.recursive) {

            pathParts.reduce((fileSystem, part) => fileSystem[part] = {}, fileSystem)

            return callback(null)
        }

        const error = new Error('ENOENT: no such file or directory')

        error.code = 'ENOENT'
        error.path = path

        return 'require' === type ? Result.Error(error) : callback(error)
    }
}

/**
 * getEntryFilesDescriptor :: Entity -> EntryFilesDescriptor
 *
 * Implementation => (Path -> Options|Callback -> Callback?) -> a
 *
 * It should help creating entry files descriptions in the virtual file system.
 */
const getEntryFilesDescriptor = ({
    categories = ['test'],
    content = '# Content',
    date = 20000101,
    excerpt = '*Excerpt*',
    slug = 'entry',
    title = 'title',
} = {}) => ({
    'content.md': { content, stat: { mtime: 0 } },
    'excerpt.md': { content: excerpt, stat: { mtime: 0 } },
    'index.js': { content: { categories, date, slug, title }, stat: { mtime: 0 } },
    static: { 'static.jpg': { stat: { mtime: 0 } } },
})

// Memo: Jest should spy `fs` and `/lib/module/require` before importing `/commands/build.js`
jest.doMock('../../lib/module/require', () => fsIO('require'))
jest.spyOn(fs, 'mkdir').mockImplementation(fsIO('mkdir'))
jest.spyOn(fs, 'stat').mockImplementation(fsIO('stat'))
jest.spyOn(fs, 'readdir').mockImplementation(fsIO('readdir'))
jest.spyOn(fs, 'readFile').mockImplementation(fsIO('readFile'))

const build = require('../../commands/build')

let config
let fileSystem
let files

beforeEach(() => {
    config = {
        dist: join('dist', 'api'),
        distIndexes: join('dist', 'api', 'categories', 'posts'),
        entitiesPerPage: 10,
        force: false,
        hash: false,
        src: 'src',
        subVersion: false,
        type: 'posts',
    }
    fileSystem = {
        dist: {
            api: { categories: { posts: {} }, posts: {} },
            static: { posts: {} },
        },
    }
    files = {
        dist: {
            cache: { content: {
                all: { 1: {
                    entities: [
                        {
                            categories: ['test'],
                            date: 19991231,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'before',
                            slug: 'before',
                            title: 'title',
                        },
                        {
                            categories: ['test'],
                            date: 20000101,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'entry',
                            slug: 'entry',
                            title: 'title',
                        },
                        {
                            categories: ['test'],
                            date: 20000102,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'after',
                            slug: 'after',
                            title: 'title',
                        },
                    ],
                    next: '',
                    prev: '',
                } },
                test: { 1: {
                    entities: [
                        {
                            categories: ['test'],
                            date: 19991231,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'before',
                            slug: 'before',
                            title: 'title',
                        },
                        {
                            categories: ['test'],
                            date: 20000101,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'entry',
                            slug: 'entry',
                            title: 'title',
                        },
                        {
                            categories: ['test'],
                            date: 20000102,
                            excerpt: '<p><em>Excerpt</em></p>\n',
                            name: 'after',
                            slug: 'after',
                            title: 'title',
                        },
                    ],
                    next: '',
                    prev: '',
                } },
            } },
            entities: {
                after: { 'index.json': { stat: { mtime: 1 } } },
                before: { 'index.json': { stat: { mtime: 1 } } },
                entry: { 'index.json': { stat: { mtime: 1 } } },
            },
            static: {
                after: { 'static.jpg': { stat: { mtime: 1 } } },
                before: { 'static.jpg': { stat: { mtime: 1 } } },
                entry: { 'static.jpg': { stat: { mtime: 1 } } },
            },
        },
        src: {
            after: getEntryFilesDescriptor({ date: 19991231, slug: 'after' }),
            before: getEntryFilesDescriptor({ date: 20000102, slug: 'before' }),
            entry: getEntryFilesDescriptor({ slug: 'entry' }),
        },
    }
})
afterEach(() => {
    jest.clearAllMocks()
})
afterAll(() => {
    jest.restoreAllMocks()
})

describe('build(config)', () => {

    it('rejects when (root) sources directory is missing', () => {

        expect.assertions(1)

        return expect(build(config).run().promise())
            .rejects.toBe(`There was an error while reading sources directory from '${config.src}'\n\n`)
    })

    it('rejects when (root) sources directory is empty', () => {

        fileSystem.src = {}

        expect.assertions(1)

        return expect(build(config).run().promise())
            .rejects.toBe(`There was no sources found in ${config.src}`)
    })
})

describe("build#getEndpointsUpdate({ type: 'posts', ...config })", () => {

    const requiredFiles = ['content.md', 'index.js', 'excerpt.md']

    // TODO: it('creates endpoints (root) directory if missing', () => {})
    it('creates (type) endpoints directory if missing', () => {

        fileSystem.src = { posts: {} }
        delete fileSystem.dist

        return build.getEndpointsUpdate(config).run().promise().catch(() =>
            expect(fs.mkdir).toHaveBeenCalledTimes(1))
    })

    it('rejects when sources (type) directory is empty (nothing to build 1/2)', () => {

        fileSystem.src = { posts: {} }

        expect.assertions(1)

        return expect(build.getEndpointsUpdate(config).run().promise())
            .rejects.toBe(`There was no '${config.type}' to build`)
    })

    it.each(requiredFiles)('rejects when a source entry is missing %s', file => {

        fileSystem.src = { posts: { entry: files.src.entry } }
        delete files.src.entry[file]

        expect.assertions(1)

        return expect(build.getEndpointsUpdate(config).run().promise())
            .rejects.toBe(`There was an error while getting '${config.type}' entities\n\n`)
    })

    it('rejects when there is only a single source entry to build that is a draft (nothing to build 2/2)', () => {

        files.src.entry['index.js'].content.draft = true
        fileSystem.src = { posts: { entry: files.src.entry } }

        expect.assertions(1)

        return expect(build.getEndpointsUpdate(config).run().promise())
            .rejects.toBe(`There was no '${config.type}' to build`)
    })

    it('resolves Update to build endpoints after adding entry [single]', () => {

        fileSystem.src = { posts: { entry: files.src.entry } }

        const entryName = 'entry'
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: entryName,
            slug: entryName,
            title: 'title',
        }
        const entry = {
            ...getEntry(entryName, config),
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entryName,
        }
        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { add: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after adding source entry and removing distribution directory [single]', () => {

        fileSystem.src = { posts: { entry: files.src.entry } }
        delete fileSystem.dist

        const entryName = 'entry'
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: entryName,
            slug: entryName,
            title: 'title',
        }
        const entry = {
            ...getEntry(entryName, config),
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entryName,
        }
        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { add: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after removing entry [single]', () => {

        fileSystem.src = { posts: {} }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry

        return expectUpdate({ config, entries: { remove: [getEntry('entry', config)] } })
    })

    it('resolves Update to build endpoints after updating index.js of an entry [single]', () => {

        files.src.entry['index.js'].content.categories = ['test-updated-index']
        files.src.entry['index.js'].stat = { mtime: 2 }
        fileSystem.src = { posts: { entry: files.src.entry } }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry

        const entryName = 'entry'
        const entityIndex = {
            categories: ['test-updated-index'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: entryName,
            slug: entryName,
            title: 'title',
        }
        const entry = {
            ...getEntry(entryName, config),
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entryName,
        }
        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, 'test-updated-index': pages }

        return expectUpdate({
            config,
            entries: { update: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after updating content.md of an entry [single]', () => {

        files.src.entry['content.md'] = { content: '# Updated content', stat: { mtime: 2 } }
        fileSystem.src = { posts: { entry: files.src.entry } }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry

        const entryName = 'entry'
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: entryName,
            slug: entryName,
            title: 'title',
        }
        const entry = {
            ...getEntry(entryName, config),
            entity: { ...entityIndex, content: '<h1 id=\"updated-content\">Updated content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: false,
            hasStaticDirUpdate: false,
            name: entryName,
        }

        return expectUpdate({ config, entries: { update: [entry] } })
    })

    it('resolves Update to build endpoints after updating excerpt.md of an entry [single]', () => {

        files.src.entry['excerpt.md'] = { content: '*Updated excerpt*', stat: { mtime: 2 } }
        fileSystem.src = { posts: { entry: files.src.entry } }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry

        const entryName = 'entry'
        const entityIndex = {
            categories: ['test'],
            date: 20000101,
            excerpt: '<p><em>Updated excerpt</em></p>\n',
            name: entryName,
            slug: entryName,
            title: 'title',
        }
        const entry = {
            ...getEntry(entryName, config),
            entity: { ...entityIndex, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: false,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entryName,
        }
        const pages = { 1: { entities: [entityIndex], next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { update: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after updating static dir of an entry [single]', () => {

        files.src.entry.static['static.jpg'] = { stat: { mtime: 2 } }
        fileSystem.src = { posts: { entry: files.src.entry } }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry
        fileSystem.dist.static.posts = { entry: files.dist.static.entry }

        const entryName = 'entry'
        const entry = {
            ...getEntry(entryName, config),
            hasEntityUpdate: false,
            hasIndexUpdate: false,
            hasStaticDirUpdate: true,
            name: entryName,
        }

        return expectUpdate({ config, entries: { update: [entry] } })
    })

    it.each(requiredFiles)('rejects when a source entry with a corresponding distribution entry, is missing %s', () => {

        delete files.src.entry['content.md']
        fileSystem.src = { posts: { entry: files.src.entry } }
        fileSystem.dist.api.posts.entry = files.dist.entities.entry
        fileSystem.dist.static.posts = { entry: files.dist.static.entry }

        expect.assertions(1)

        return expect(build.getEndpointsUpdate(config).run().promise())
            .rejects.toBe(`There was an error while getting updated '${config.type}'\n\n`)
    })

    it('resolves Update to build endpoints after adding an entry [with cache]', () => {

        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = files.dist.cache
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static
        delete files.dist.entities.entry
        delete files.dist.static.entry

        /* eslint-disable sort-keys */
        const entityIndexes = {
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            entry: {
                categories: ['test'],
                date: 20000101,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'entry',
                slug: 'entry',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
        }
        /* eslint-enable sort-keys */
        const entry = {
            ...getEntry(entityIndexes.entry.name, config),
            entity: { ...entityIndexes.entry, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndexes.entry.name,
        }
        const pages = { 1: { entities: Object.values(entityIndexes), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { add: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after removing an entry [with cache]', () => {

        delete files.src.entry
        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = files.dist.cache
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static.entry

        /* eslint-disable sort-keys */
        const entityIndexes = {
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
        }
        /* eslint-enable sort-keys */
        const pages = { 1: { entities: Object.values(entityIndexes), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { remove: [getEntry('entry', config)] },
            indexes: { cache: indexes, write: indexes },
        })

    })

    it('resolves Update to build endpoints after updating index.js of an entry [with cache]', () => {

        files.src.entry['index.js'].content.categories = ['test-updated-index']
        files.src.entry['index.js'].stat = { mtime: 2 }
        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = files.dist.cache
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static

        /* eslint-disable sort-keys */
        const entityIndexes = {
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            entry: {
                categories: ['test-updated-index'],
                date: 20000101,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'entry',
                slug: 'entry',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
        }
        /* eslint-enable sort-keys */
        const entry = {
            ...getEntry(entityIndexes.entry.name, config),
            entity: { ...entityIndexes.entry, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entityIndexes.entry.name,
        }
        const indexes = {
            all: { 1: { entities: Object.values(entityIndexes), next: '', prev: '' } },
            test: { 1: { entities: [entityIndexes.before, entityIndexes.after], next: '', prev: '' } },
            'test-updated-index': { 1: { entities: [entityIndexes.entry], next: '', prev: '' } },
        }

        return expectUpdate({
            config,
            entries: { update: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after updating content.md of an entry [with cache]', () => {

        files.src.entry['content.md'] = { content: '# Updated content', stat: { mtime: 2 } }
        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = files.dist.cache
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static

        /* eslint-disable sort-keys */
        const entityIndexes = {
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            entry: {
                categories: ['test'],
                date: 20000101,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'entry',
                slug: 'entry',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
        }
        /* eslint-enable sort-keys */
        const entry = {
            ...getEntry(entityIndexes.entry.name, config),
            entity: { ...entityIndexes.entry, content: '<h1 id=\"updated-content\">Updated content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: false,
            hasStaticDirUpdate: false,
            name: entityIndexes.entry.name,
        }
        const pages = { 1: { entities: Object.values(entityIndexes), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { update: [entry] },
            indexes: { cache: indexes },
        })
    })

    it('resolves Update to build endpoints after updating index.js of an entry [with cache]', () => {

        files.src.entry['excerpt.md'] = { content: '*Updated excerpt*', stat: { mtime: 2 } }
        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = files.dist.cache
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static

        /* eslint-disable sort-keys */
        const entityIndexes = {
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            entry: {
                categories: ['test'],
                date: 20000101,
                excerpt: '<p><em>Updated excerpt</em></p>\n',
                name: 'entry',
                slug: 'entry',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
        }
        /* eslint-enable sort-keys */
        const entry = {
            ...getEntry(entityIndexes.entry.name, config),
            entity: { ...entityIndexes.entry, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: false,
            hasIndexUpdate: true,
            hasStaticDirUpdate: false,
            name: entityIndexes.entry.name,
        }
        const pages = { 1: { entities: Object.values(entityIndexes), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { update: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    it('resolves Update to build endpoints after adding an entry [with paginaton][with cache]', () => {

        config.entitiesPerPage = 1

        fileSystem.src = { posts: files.src }
        fileSystem.dist.api.categories.posts['cache.json'] = { content: {
            all: {
                1: {
                    entities: [{
                        categories: ['test'],
                        date: 19991231,
                        excerpt: '<p><em>Excerpt</em></p>\n',
                        name: 'before',
                        slug: 'before',
                        title: 'title',
                    }],
                    next: 'page/2/',
                    prev: '',
                },
                2: {
                    entities: [{
                        categories: ['test'],
                        date: 20000102,
                        excerpt: '<p><em>Excerpt</em></p>\n',
                        name: 'after',
                        slug: 'after',
                        title: 'title',
                    }],
                    next: '',
                    prev: 'page/1/',
                },
            },
            test: {
                1: {
                    entities: [{
                        categories: ['test'],
                        date: 19991231,
                        excerpt: '<p><em>Excerpt</em></p>\n',
                        name: 'before',
                        slug: 'before',
                        title: 'title',
                    }],
                    next: 'page/2',
                    prev: '',
                },
                2: {
                    entities: [{
                        categories: ['test'],
                        date: 20000102,
                        excerpt: '<p><em>Excerpt</em></p>\n',
                        name: 'after',
                        slug: 'after',
                        title: 'title',
                    }],
                    next: '',
                    prev: 'page/1',
                },
            },
        } }
        fileSystem.dist.api.posts = files.dist.entities
        fileSystem.dist.static = files.dist.static
        delete files.dist.entities.entry
        delete files.dist.static.entry

        const entityIndexes = {
            /* eslint-disable sort-keys */
            before: {
                categories: ['test'],
                date: 19991231,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'before',
                slug: 'before',
                title: 'title',
            },
            entry: {
                categories: ['test'],
                date: 20000101,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'entry',
                slug: 'entry',
                title: 'title',
            },
            after: {
                categories: ['test'],
                date: 20000102,
                excerpt: '<p><em>Excerpt</em></p>\n',
                name: 'after',
                slug: 'after',
                title: 'title',
            },
            /* eslint-enable sort-keys */
        }
        const entry = {
            ...getEntry(entityIndexes.entry.name, config),
            entity: { ...entityIndexes.entry, content: '<h1 id=\"content\">Content</h1>\n' },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entityIndexes.entry.name,
        }
        const pagesWrite = {
            2: { entities: [entityIndexes.entry], next: 'page/3/', prev: 'page/1/' },
            3: { entities: [entityIndexes.after], next: '', prev: 'page/2/' },
        }
        const pagesCache = {
            1: { entities: [entityIndexes.before], next: 'page/2/', prev: '' },
            ...pagesWrite,
        }
        const write = { all: pagesWrite, test: pagesWrite }
        const cache = { all: pagesCache, test: pagesCache }

        return expectUpdate({
            config,
            entries: { add: [entry] },
            indexes: { cache, write },
        })
    })

    // TODO: add an assertion to match against Update.manifest
    it('resolves Update to build endpoints after adding an entry [with hash]', () => {

        config.hash = true
        fileSystem.src = { posts: { entry: files.src.entry } }

        const content = '<h1 id=\"content\">Content</h1>\n'
        const entryName = 'entry'
        /* eslint-disable sort-keys */
        const entityIndex = {
            excerpt: '<p><em>Excerpt</em></p>\n',
            name: entryName,
            categories: ['test'],
            date: 20000101,
            slug: entryName,
            title: 'title',
        }
        /* eslint-enable sort-keys */
        entityIndex.hash = getHash(JSON.stringify({ content, ...entityIndex }))

        const entry = {
            ...getEntry(entryName, config),
            distIndex: join(config.dist, 'posts', entryName, `index-${entityIndex.hash}.json`),
            entity: { ...entityIndex, content },
            hasEntityUpdate: true,
            hasIndexUpdate: true,
            name: entryName,
        }
        const pages = { 1: { entities: [entityIndex], hash: getHash(entityIndex.hash), next: '', prev: '' } }
        const indexes = { all: pages, test: pages }

        return expectUpdate({
            config,
            entries: { add: [entry] },
            indexes: { cache: indexes, write: indexes },
        })
    })

    // TODO: it should return Update to build endpoints after adding multiple entries [with hash]
    // TODO: it should reject when config.subVersion is true and config.hash is false
    // TODO: it should keep old endpoints when config.subVersion is true
})
