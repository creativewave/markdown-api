
const assign = require('lodash/fp/assign')
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const setEntry = require('../lib/entry/setEntry')
const slugify = require('../lib/slugify')

/**
 * set :: Options -> Task Error Results
 */
const set = ({ name, src, type, ...entity }, slug = slugify(entity.title)) =>
    setEntry({ entity: assign({ slug }, entity), ...getEntry(src, '', type, name) })
        .orElse(logReject('There was an error while trying to set entry'))

module.exports = set
