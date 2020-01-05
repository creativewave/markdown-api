
const add = require('../commands/add.js')
const cli = require('commander')
const config = require('../lib/config')
const getConfig = require('../lib/config/get')
const log = require('../lib/console/log')
const logReject = require('../lib/console/logReject')
const split = require('lodash/fp/split')
const validate = require('../lib/config/validate')

const required = ['src', 'title', 'type']
const included = [...required, 'categories', 'content', 'date', 'excerpt']

/**
 * runAdd :: Configuration -> void
 */
const runAdd = userConfig => {
    console.time('API entry created in')
    validate(required, getConfig(included)({ ...config, ...userConfig }))
        .orElse(logReject('Invalid parameter'))
        .chain(add)
        .map(() => {
            log(`"${userConfig.title}" has been successfully added to ${userConfig.type} entries`)
            console.timeEnd('API entry created in')
        })
        .run()
}

cli
    .name('api add')
    .option('-t, --type <type>', 'type for the new entry (required)')
    .option('-s, --src <src>', 'path to sources directory (required)', config.src)
    .option('-T, --title <title>', 'title for the new entry (required)', config.title)
    .option('-c, --content [content]', 'content for the new entry', config.content)
    .option('-e, --excerpt [excerpt]', 'excerpt for the new entry', config.excerpt)
    .option('-C, --categories [categories]', 'categories for the new entry', split(','), config.categories)
    .option('-D, --date [date]', 'date for the new entry', config.date)
    .action(runAdd)
    .parse(process.argv)
