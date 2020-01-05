
const slug = require('../slugify')

const renderHeading = defaultRenderer => (text, level, raw) =>
    defaultRenderer(text, level, raw, { slug })

module.exports = renderHeading
