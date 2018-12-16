
const marked = require('marked')
const memoize = require('lodash/fp/memoize')
const renderCode = require('./code')
// const renderHTML = require('./html')
const renderImage = require('./image')

const renderer = new marked.Renderer()

renderer.code = renderCode

/**
 * getMarked :: String -> String -> String
 */
const getMarked = staticUrlsPath => rawContent => {

    // renderer.html = renderHTML(staticUrlsPath)
    renderer.image = renderImage(staticUrlsPath)

    return marked(rawContent, { renderer })
}

module.exports = memoize(getMarked)
