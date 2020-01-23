
const Result = require('folktale/result')

/**
 * isNotEmpty :: (Argument -> [Argument]) -> Result Error Argument
 *
 * It should return `Error` if `Argument` has an empty `String` value.
 */
const isNotEmpty = arg => arg[1] ? Result.Ok(arg) : Result.Error(`--${arg[0]} requires a non empty value.`)

/**
 * isNumericDate :: (Argument -> [Argument]) -> Result Error Argument
 *
 * Argument => [String, String]
 *
 * It should return `Error` if `Argument` is not a `String` representing a date
 * with format `YYYYMMDD`, where `MM` should be between 1 and 12 and `DD` should
 * be between 1 and 31.
 */
const isNumericDate = arg => {
    if (arg[1].length !== 8) {
        return Result.Error(`${arg[0]} has an invalid date representation: ${arg[1]}.`)
    }
    const month = arg[1].slice(4, 6)
    if (month < 1 || 12 < month) {
        return Result.Error(`${arg[0]} has an invalid month representation: ${arg[1]}.`)
    }
    const day = arg[1].slice(6)
    if (day < 1 || 31 < day) {
        return Result.Error(`${arg[0]} has an invalid day representation: ${arg[1]}.`)
    }
    return Result.Ok(arg)
}

module.exports = {
    isNotEmpty,
    isNumericDate,
}
