
const cli = require('commander')
const config = require('../lib/config')
const getConfig = require('../lib/config/get')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const set = require('../commands/set.js')
const split = require('lodash/fp/split')
const validate = require('../lib/config/validate')

const required = ['name', 'src', 'type']
const included = [...required, 'categories', 'content', 'date', 'excerpt', 'title']

/**
 * runSet :: Configuration -> void
 */
const runSet = userConfig => {
    console.time('API source set in')
    validate(required, getConfig(included)({ ...config, ...userConfig }))
        .orElse(logReject('Invalid parameter'))
        .chain(set)
        .map(() => {
            log(`The entry "${userConfig.name}" has been successfully updated`)
            console.timeEnd('API source set in')
        })
        .run()
}

cli
    .name('api update')
    .option('-t, --type <type>', 'type for the new entry (required)')
    .option('-s, --src <src>', 'path to sources directory (required)', config.src)
    .option('-n, --name <name>', 'name of the directory containing the sources files (required)')
    .option('-T, --title [title]', 'new title for the entry')
    .option('-c, --content [content]', 'new content for the entry')
    .option('-e, --excerpt [excerpt]', 'new excerpt for the entry')
    .option('-C, --categories [categories]', 'new categories for the entry', split(','))
    .option('-D, --date [date]', 'date for the new entry')
    .action(runSet)
    .parse(process.argv)
