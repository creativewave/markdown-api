
const assign = require('lodash/fp/assign')
const getHash = require('../string/getHash')
const setSuffix = require('../string/setSuffix')

/**
 * setHash :: Entry -> Task Error Entry
 *
 * TODO: find a more accurate name or a different implementation, as it sets
 * `entry.distIndex` and `entry.entity.hash` but not `entry.hash`.
 *
 * TODO (fix hash): create separate hashes for entity (using all contents) and
 * its index (using only indexable contents).
 */
const setHash = ({ distIndex, entity, ...entry }) => {

    const hash = getHash(JSON.stringify(entity))

    return {
        ...entry,
        distIndex: setSuffix(distIndex, hash),
        entity: assign({ hash }, entity),
    }
}

module.exports = setHash
