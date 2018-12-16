
const renderHTML = staticUrlsPath => html => html.replace(/href="static/g, `href="${staticUrlsPath}`)

module.exports = renderHTML
