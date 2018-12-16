
const curry = require('lodash/fp/curryN')
const path = require('path')

/**
 * getJoinedPath :: Number|...String -> ...String -> String
 */
const getJoinedPath = (joins, ...paths) =>
    typeof joins === 'string'
        ? path.join(joins, ...paths)
        : paths.length === joins
            ? path.join(...paths)
            : 0 === paths.length
                ? curry(joins, path.join)
                : curry(joins - paths.length, (...otherPaths) => path.join(...paths, ...otherPaths))

module.exports = getJoinedPath
