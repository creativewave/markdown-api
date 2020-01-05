
const compose = require('lodash/fp/compose')
const getStat = require('./getStat')
const map = require('../collection/map')
const prop = require('lodash/fp/prop')

/**
 * getLastModifiedTime :: Path -> Task Error Date
 */
const getLastModifiedTime = compose(map(prop('mtime')), getStat)

module.exports = getLastModifiedTime
