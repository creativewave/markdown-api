
const add = require('../commands/add.js')
const cli = require('../lib/command')
const log = require('../lib/console/log')
const parameter = require('../lib/command/parameter')

cli('api add', 'Scaffold a new source entry.')
    .parameter(parameter.categories)
    .parameter(parameter.content)
    .parameter(parameter.date)
    .parameter(parameter.excerpt)
    .parameter(parameter.src)
    .parameter(parameter.title)
    .parameter(parameter.type)
    .action(args => {
        console.time('API entry created in')
        add(args)
            .map(() => {
                log(`"${args.title}" has been successfully added to ${args.type} entries`)
                console.timeEnd('API entry created in')
            })
            .run()
    })
    .parse(process.argv)
