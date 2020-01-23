
const log = require('./log')
const Result = require('folktale/result')

/**
 * logError :: String -> Error -> Result Error
 */
const logError = error => Result.Error(log('error', error))

module.exports = logError
