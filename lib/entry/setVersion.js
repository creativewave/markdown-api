
/**
 * setVersion :: Entry -> Task Error Entry
 */
const setVersion = ({ entity, ...entry }) =>
    ({ ...entry, entity: { ...entity, version: entity.hash } })

module.exports = setVersion
