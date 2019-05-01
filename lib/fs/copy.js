
const copyDirectory = require('./copyDirectory')
const copyFile = require('./copyFile')
const getStat = require('./getStat')

/**
 * copy :: Path -> Path -> Options? -> Task Error [Path]
 *
 * Options => { exclude: [String], recursive: Boolean }
 *
 * Note: `exclude` can contain directory file names (not paths) to not copy.
 * Note: using this function has a performance cost over `copyDirectory` or
 * `copyFile`. Prefer using the latters when the file type is known.
 */
const copy = (file, dest, options = {}) =>
    getStat(file)
        .chain(stat => stat.isDirectory()
            ? copyDirectory(file, dest, options)
            : copyFile(file, dest))

module.exports = copy
