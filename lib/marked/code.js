
const highlightJs = require('highlightjs')
const defaultRenderer = require('./default')

const renderCode = (code, language, escaped) => {

    const isLanguageValid = !!(language && highlightJs.getLanguage(language))

    return isLanguageValid
        ? `<pre><code class="${language}">${highlightJs.highlight(language, code).value}</code></pre>`
        : defaultRenderer('code', code, language, escaped)
}

module.exports = renderCode
