
const Result = require('folktale/result')

/**
 * safeRequire :: Path -> Result Error Module
 *
 * TODO(refactoring): move into lib/fs.
 */
const safeRequire = path => {
    try {
        return Result.Ok(require(path))
    } catch (error) {
        if (error.code === 'MODULE_NOT_FOUND') {
            return Result.Error(error)
        }
        throw error
    }
}

module.exports = safeRequire
