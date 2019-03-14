
const addEntry = require('../lib/entry/addEntry')
const assign = require('lodash/fp/assign')
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const slugify = require('../lib/slugify')

/**
 * add :: Options -> Task Error Results
 */
const add = ({ src, type, ...entity }, slug = slugify(entity.title)) =>
    addEntry({ entity: assign({ draft: true, slug }, entity), ...getEntry(slug, { src, type }) })
        .orElse(logReject('There was an error while trying to add entry'))

module.exports = add
