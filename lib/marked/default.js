
const marked = require('marked')

const defaultRenderer = (block, ...args) => marked.Renderer.prototype[block].bind(marked)(...args)

module.exports = defaultRenderer
