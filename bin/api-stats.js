
const cli = require('../lib/command')

cli('api stats', 'Output resources statistics (not implemented yet).')
    .action(() => console.log('TODO'))
    .parse(process.argv)
