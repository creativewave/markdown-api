
const compose = require('lodash/fp/compose')
const copyFile = require('./copyFile')
const join = require('../path/getJoinedPath')
const last = require('lodash/fp/last')
const mapTask = require('../collection/mapTask')
const path = require('path')
const split = require('lodash/fp/split')

/**
 * copyFiles :: [Path] -> Path -> Task Error [Path]
 */
const copyFiles = (files, dest) => mapTask(
    srcFile => compose(
        destFile => copyFile(srcFile, destFile),
        join(2, dest),
        last,
        split(path.sep)),
    files)

module.exports = copyFiles
