
const assign = require('lodash/fp/assign')

/**
 * setVersion :: Entry -> Task Error Entry
 */
const setVersion = ({ entity, ...entry }) => ({ ...entry, entity: assign({ version: entity.hash }, entity) })

module.exports = setVersion
