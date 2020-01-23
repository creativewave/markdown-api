
const build = require('../commands/build.js')
const cli = require('../lib/command')
const parameter = require('../lib/command/parameter')
const Watcher = require('watchpack')

/**
 * runBuild :: Configuration -> void
 */
const runBuild = args => {
    console.time('API endpoints built in')
    build(args)
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

cli('api build', 'Create/remove/update endpoints.')
    .parameter(parameter.dist)
    .parameter(parameter.entitiesPerPage)
    .parameter(parameter.force)
    .parameter(parameter.hash)
    .parameter(parameter.src)
    .parameter(parameter.subVersion)
    .parameter(parameter.watch)
    .action(args => {
        args.watch && runWatcher(args.src, () => runBuild(args))
        runBuild(args)
    })
    .parse(process.argv)
