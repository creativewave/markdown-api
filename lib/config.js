
const getDateToNumber = require('./date/getDateToNumber')
const join = require('./path/getJoinedPath')
const mapValues = require('lodash/fp/mapValues')
const path = require('path')
const safeRequire = require('./module/require')

const cwd = process.cwd()
const defaultConfig = {
    categories: [],
    content: 'Introduction\n\n## Chapter 1\n\n## Chapter 2\n\n## Chapter 3\n\n## Conclusion',
    date: getDateToNumber(new Date()),
    dist: join(cwd, 'dist', 'api'),
    entitiesPerPage: 10,
    excerpt: 'TODO: excerpt.',
    force: false,
    hash: false,
    // renderers: {
    //     markdown: '../renderers/marked',
    //     static: '../renderers/static',
    // },
    src: join(cwd, 'src', 'api'),
    subVersion: false,
    title: 'New post',
    watch: false,
}
const userConfig = safeRequire(path.resolve('api.config')).getOrElse({})

module.exports = mapValues(v => typeof v === 'function' ? v() : v, { ...defaultConfig, ...userConfig })
