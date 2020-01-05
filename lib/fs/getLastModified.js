
const compose = require('lodash/fp/compose')
const getLastModifiedTimes = require('./getLastModifiedTimes')
const isEqual = require('lodash/fp/isEqual')
const map = require('../collection/map')
const max = require('lodash/fp/max')

/**
 * getLastModified :: [Path] -> Task Error Path
 */
const getLastModified = paths => compose(
    map(index => paths[index]),
    map(dates => dates.findIndex(isEqual(max(dates)))),
    getLastModifiedTimes,
)(paths)

module.exports = getLastModified
