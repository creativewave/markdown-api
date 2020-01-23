#!/usr/bin/env node

'use strict'

require('../lib/command')('api', 'Manage (CRUD) source entries and build distribution endpoints.')
    .command('build', 'build endpoints')
    .command('add', 'add new entry')
    .command('remove', 'remove an entry and its endpoints')
    .command('set', 'set entry data')
    .command('stats', 'show statistics (entries count, names, etc...)')
    .parse(process.argv)
