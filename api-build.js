/* eslint-disable no-console */

const build = require('./commands/build.js')
const cli = require('commander')
const config = require('./lib/config')
const getOptions = require('./lib/config/getOptions')
const logReject = require('./lib/console/logReject')
const validate = require('./lib/config/validate')
const Watcher = require('watchpack')

const included = ['dist', 'entitiesPerPage', 'force', 'hash', 'src', /*'type',*/ 'subVersion']
const required = ['dist', 'src']

/**
 * runBuild :: Options -> void
 *
 * TODO: invalidate if `options.hash === false && options.version === true`.
 */
const runBuild = options => {
    console.time('API endpoints built in')
    validate(required, options)
        .orElse(logReject('Invalid parameter'))
        .map(getOptions(included))
        .chain(build)
        .map(results => Object.entries(results).map(([type, { entities, indexes }]) => {
            console.group(type)
            console.table({ entities })
            console.table({ indexes })
            console.groupEnd()
        }))
        .map(() => console.timeEnd('API endpoints built in'))
        .run()
}

/**
 * runWatcher :: Path -> ([Path] -> void) -> void
 */
const runWatcher = (src, handleChange) => {
    const watcher = new Watcher({ aggregateTimeout: 1000, poll: true })
    watcher.watch([], [src], Date.now() - 10000)
    watcher.on('aggregated', handleChange)
}

cli
    .name('api build')
    .option('-s, --src <path>', 'path to sources directory (required)', config.src)
    .option('-d, --dist <path>', 'path to distribution directory (required)', config.dist)
    .option('-f, --force', 'build without checking if sources have been updated', config.force)
    .option('-p, --entitiesPerPage <number>', 'entities per (index) page', config.entitiesPerPage)
    .option('-h, --hash', 'create endpoints using hashes for long term cache', config.hash)
    .option('-S, --subVersion', 'keep previous generated (JSON) endpoints', config.subVersion)
    .option('-w, --watch', 'automatically build on change', config.watch)
    .action(options => {
        options.watch && runWatcher(options.src, () => runBuild(options))
        runBuild(options)
    })
    .parse(process.argv)
