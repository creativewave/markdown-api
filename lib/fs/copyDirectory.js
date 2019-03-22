
const addDirectory = require('./addDirectory')
const getDirectoryFilesNames = require('./getDirectoryFilesNames')
const join = require('../path/getJoinedPath')
const mapTask = require('../lambda/mapTask')

/**
 * copyDirectory :: Path -> Path -> Options -> Task Error Path
 *
 * Options => { exclude: [String], recursive: Boolean }
 *
 * Note: `exclude` can contain names (not paths) to not copy.
 * Note: using `recursive: true` has a performance cost.
 * Note: `copy` is required at runtime to avoid circular dependency.
 */
const copyDirectory = (src, dest, { exclude = [], recursive = false } = {}) =>
    addDirectory(dest).and(getDirectoryFilesNames(src))
        .map(([, names]) => names.filter(name => !exclude.includes(name)))
        .chain(mapTask(name =>
            require(recursive ? './copy' : './copyFile')(join(src, name), join(dest, name), { exclude, recursive })))
        .map(() => dest)

module.exports = copyDirectory
