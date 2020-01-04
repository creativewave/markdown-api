
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const setEntry = require('../lib/entry/setEntry')
const slugify = require('../lib/slugify')
const toCompact = require('../lib/collection/toCompact')

/**
 * set :: Configuration -> Task Error Results
 */
const set = ({ name, src, type, ...entity }, slug = slugify(entity.title)) =>
    setEntry({ entity: { ...toCompact(entity), slug }, ...getEntry(name, { src, type }) })
        .orElse(logReject('There was an error while trying to set entry'))

module.exports = set
