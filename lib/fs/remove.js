
const getStat = require('./getStat')
const removeDirectory = require('./removeDirectory')
const removeFile = require('./removeFile')

/**
 * remove :: Path -> Task Error [Path]
 *
 * Note: using this function has a performance cost over `removeDirectory` or
 * `removeFile`. Prefer using the latters when the file type is known.
 */
const remove = file =>
    getStat(file).chain(stat =>
        stat.isDirectory()
            ? removeDirectory(file, { recursive: true })
            : removeFile(file))

module.exports = remove
