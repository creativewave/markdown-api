
const compose = require('lodash/fp/compose')
const getStat = require('./getStat')
const map = require('../lambda/map')
const prop = require('lodash/fp/prop')

/**
 * getFileLastModifiedTime :: Path -> Task Error Date
 */
const getFileLastModifiedTime = compose(map(prop('mtime')), getStat)

module.exports = getFileLastModifiedTime
