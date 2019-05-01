
const getHash = require('../string/getHash')
const setSuffix = require('../string/setSuffix')

/**
 * setHash :: Entry -> Task Error Entry
 *
 * TODO(refactoring): find a more accurate name or a different implementation,
 * as it sets `entry.distIndex` and `entry.entity.hash` but not `entry.hash`.
 *
 * TODO(fix): create separate hashes for the entity (using all contents) and its
 * index (using only indexable contents).
 */
const setHash = ({ distIndex, entity, ...entry }) => {

    const hash = getHash(JSON.stringify(entity))

    return {
        ...entry,
        distIndex: setSuffix(distIndex, hash),
        entity: { ...entity, hash },
    }
}

module.exports = setHash
