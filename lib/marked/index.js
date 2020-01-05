
const marked = require('marked')
const memoize = require('lodash/fp/memoize')
const renderCode = require('./code')
const renderHeading = require('./heading')
// const renderHTML = require('./html')
const renderImage = require('./image')

const renderer = new marked.Renderer()
const getDefaultRenderer = type => (...args) => marked.Renderer.prototype[type].bind(renderer)(...args)

renderer.code = renderCode(getDefaultRenderer('code'))
renderer.heading = renderHeading(getDefaultRenderer('heading'))

/**
 * getMarked :: String -> String -> String
 */
const getMarked = staticUrlsPath => rawContent => {

    // renderer.html = renderHTML(staticUrlsPath)
    renderer.image = renderImage(staticUrlsPath, getDefaultRenderer('image'))

    return marked(rawContent, { renderer })
}

module.exports = memoize(getMarked)
