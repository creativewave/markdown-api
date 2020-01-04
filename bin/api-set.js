
const cli = require('commander')
const config = require('../lib/config')
const getOptions = require('../lib/config/getOptions')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const set = require('../commands/set.js')
const split = require('lodash/fp/split')
const validate = require('../lib/config/validate')

const included = ['categories', 'content', 'date', 'excerpt', 'name', 'src', 'title', 'type']
const required = ['name', 'src', 'type']

/**
 * runSet :: Options -> void
 */
const runSet = options => {
    console.time('API source set in')
    validate(required, options)
        .orElse(logReject('Invalid parameter'))
        .map(getOptions(included))
        .chain(set)
        .map(() => {
            log(`The entry "${options.name}" has been successfully updated`)
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
