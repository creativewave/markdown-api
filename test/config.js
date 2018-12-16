
const assert = require('assert')
const config = require('../lib/config')
const cli = require('commander')

describe('config', () => {
    it('should return a default configuration for the build command', () =>
        cli
            .name('api build')
            .option('-s, --src <path>', 'path to sources directory (required)', config.src)
            .option('-d, --dist <path>', 'path to distribution directory (required)', config.dist)
            .option('-f, --force', 'build without checking if sources have been updated', config.force)
            .option('-p, --entitiesPerPage <number>', 'entities per (index) page', config.entitiesPerPage)
            .option('-w, --watch', 'automatically build on change', config.watch)
            .action(options => ['dist', 'entitiesPerPage', 'src'].forEach(option =>
                assert.deepStrictEqual({ [option]: options[option] }, { [option]: config[option] })))
            .parse([]))
})
