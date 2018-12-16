
const Result = require('folktale/result')

/**
 * safeRequire :: Path -> Result Error Module
 */
const safeRequire = path => {
    try {
        return Result.Ok(require(path))
    } catch (e) {
        return Result.Error(e)
    }
}

module.exports = safeRequire
