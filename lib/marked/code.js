
const highlightJs = require('highlight.js')

const renderCode = defaultRenderer => (code, language, escaped) => {

    const isLanguageValid = !!(language && highlightJs.getLanguage(language))

    return isLanguageValid
        ? `<pre><code class="${language}">${highlightJs.highlight(code, { language }).value}</code></pre>`
        : defaultRenderer(code, language, escaped)
}

module.exports = renderCode
