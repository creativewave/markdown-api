/* eslint-disable no-console */

const cli = require('commander')
const config = require('../lib/config')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const remove = require('../commands/remove.js')
const validate = require('../lib/config/validate')

const required = ['dist', 'name', 'src', 'type']

/**
 * runRemove :: Options -> void
 */
const runRemove = options => {
    console.time('API source/endpoint removed in')
    validate(required, options)
        .orElse(logReject('Invalid parameter'))
        .chain(remove)
        .map(() => {
            log(`The entry "${options.name}" has been successfully removed`)
            console.timeEnd('API source/endpoint removed in')
        })
        .run()
}

cli
    .name('api remove')
    .option('-t, --type <type>', 'type for the new entry (required)')
    .option('-s, --src <src>', 'path to sources directory (required)', config.src)
    .option('-d, --dist <dist>', 'path to distribution directory (required)', config.dist)
    .option('-n, --name <name>', 'name of the directory containing the sources files (required)')
    .action(runRemove)
    .parse(process.argv)
