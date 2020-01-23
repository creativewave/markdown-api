
const cli = require('../lib/command')
const log = require('../lib/console/log')
const parameter = require('../lib/command/parameter')
const remove = require('../commands/remove.js')

cli('api remove', 'Remove a resource entry.')
    .parameter(parameter.dist)
    .parameter(parameter.name)
    .parameter(parameter.src)
    .parameter(parameter.type)
    .action(args => {
        console.time('API source/endpoint removed in')
        remove(args)
            .map(() => {
                log(`The entry "${args.name}" has been successfully removed`)
                console.timeEnd('API source/endpoint removed in')
            })
            .run()
    })
    .parse(process.argv)
