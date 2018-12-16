
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const removeEntry = require('../lib/entry/removeEntry')

/**
 * remove :: Options -> Task Error Results
 */
const remove = ({ dist, name, src, type }) =>
    removeEntry(getEntry(src, dist, type, name))
        .orElse(logReject('There was an error while trying to remove entry'))

module.exports = remove
