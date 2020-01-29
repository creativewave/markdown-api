
const config = require('../config')

module.exports = {
    categories: {
        default: config.categories,
        definition: '-C, --categories <...string>',
        description: 'categories for the new entry',
    },
    content: {
        default: config.content,
        definition: '-c, --content <string>',
        description: 'content for the new entry',
    },
    date: {
        default: config.date,
        definition: '-D, --date <number>',
        description: 'date for the new entry',
    },
    dist: {
        default: config.dist,
        definition: '-d, --dist <path>',
        description: 'path to distribution directory (required)',
    },
    entitiesPerPage: {
        default: config.entitiesPerPage,
        definition: '-p, --entities-per-page <number>',
        description: 'entities per (index) page',
    },
    excerpt: {
        default: config.excerpt,
        definition: '-e, --excerpt <string>',
        description: 'excerpt for the new entry',
    },
    force: {
        default: config.force,
        definition: '-f, --force',
        description: 'build without checking if sources have been updated',
    },
    hash: {
        default: config.hash,
        definition: '-h, --hash',
        description: 'create endpoints using hashes for long term cache',
        process: (hash, args) => hash || args.some(([name, value]) => name === 'sub-version' && value) || config.subVersion,
    },
    name: {
        definition: '-n, --name <string>',
        description: 'name of the directory containing the sources files (required)',
    },
    src: {
        default: config.src,
        definition: '-s, --src <string>',
        description: 'path to sources directory (required)',
    },
    subVersion: {
        default: config.subVersion,
        definition: '-S, --sub-version',
        description: 'keep previous generated (JSON) endpoints',
    },
    title: {
        default: config.title,
        definition: '-T, --title <string>',
        description: 'title for the new entry (required)',
    },
    type: {
        definition: '-t, --type <string>',
        description: 'type for the new entry (required)',
    },
    watch: {
        default: config.watch,
        definition: '-w, --watch',
        description: 'automatically build on change',
    },
}
