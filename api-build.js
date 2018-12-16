/* eslint-disable no-console */

const build = require('./commands/build.js')
const cli = require('commander')
const config = require('./lib/config')
const logReject = require('./lib/console/logReject')
const map = require('./lib/lambda/map')
const validate = require('./lib/config/validate')
const Watcher = require('watchpack')

const required = ['dist', 'entitiesPerPage', 'src']

/**
 * runBuild :: Options -> void
 */
const runBuild = options => {
    console.time('API endpoints built in')
    validate(required, options)
        .orElse(logReject('Invalid parameter'))
        .chain(build)
        .map(map(result => {
            console.group(result.type)
            console.table({ entities: result.entities })
            console.table({ indexes: result.indexes })
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
    .option('-w, --watch', 'automatically build on change', config.watch)
    .action(options => {
        options.watch && runWatcher(options.src, () => runBuild(options))
        runBuild(options)
    })
    .parse(process.argv)
