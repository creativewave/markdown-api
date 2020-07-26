
const marked = require('marked')
const memoize = require('lodash/fp/memoize')
const renderCode = require('./code')
const renderHeading = require('./heading')
// const renderHTML = require('./html')
const renderImage = require('./image')

const getDefaultRenderer = type => (...args) => marked.Renderer.prototype[type].bind(marked.defaults.renderer)(...args)

const renderer = {
    code: renderCode(getDefaultRenderer('code')),
    heading: renderHeading(getDefaultRenderer('heading')),
}

/**
 * getMarked :: String -> String -> String
 */
const getMarked = staticUrlsPath => rawContent => {

    // renderer.html = renderHTML(staticUrlsPath)
    renderer.image = renderImage(staticUrlsPath, getDefaultRenderer('image'))

    marked.use({ renderer })

    return marked(rawContent)
}

module.exports = memoize(getMarked)
