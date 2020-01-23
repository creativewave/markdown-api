
const getDateToNumber = require('./date/getDateToNumber')
const mapValues = require('lodash/fp/mapValues')
const path = require('path')
const safeRequire = require('./module/require')

const defaultConfig = {
    categories: [],
    content: 'Introduction\n\n## Chapter 1\n\n## Chapter 2\n\n## Chapter 3\n\n## Conclusion',
    date: getDateToNumber(new Date()),
    dist: path.resolve(process.cwd(), 'dist', 'api'),
    entitiesPerPage: 10,
    excerpt: 'TODO: excerpt.',
    force: false,
    hash: false,
    // renderers: {
    //     markdown: '../renderers/marked',
    //     static: '../renderers/static',
    // },
    src: path.resolve(process.cwd(), 'src', 'api'),
    subVersion: false,
    title: 'New post',
    watch: false,
}
const userConfig = safeRequire(path.resolve('api.config')).getOrElse({})

module.exports = mapValues(v => typeof v === 'function' ? v() : v, { ...defaultConfig, ...userConfig })
