
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const removeEntry = require('../lib/entry/removeEntry')

/**
 * remove :: Configuration -> Task Error Results
 */
const remove = config =>
    removeEntry(getEntry(config.name, config))
        .orElse(logReject('There was an error while trying to remove entry'))

module.exports = remove
