
const compose = require('lodash/fp/compose')
const getFilesLastModifiedTimes = require('./getFilesLastModifiedTimes')
const isEqual = require('lodash/fp/isEqual')
const map = require('../lambda/map')
const max = require('lodash/fp/max')

const getLastModifiedFile = files => compose(
    map(index => files[index]),
    map(dates => dates.findIndex(isEqual(max(dates)))),
    getFilesLastModifiedTimes,
)(files)

module.exports = getLastModifiedFile
