
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const removeEntry = require('../lib/entry/removeEntry')

/**
 * remove :: Options -> Task Error Results
 */
const remove = options =>
    removeEntry(getEntry(options.name, options))
        .orElse(logReject('There was an error while trying to remove entry'))

module.exports = remove
