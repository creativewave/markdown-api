
const getExtension = require('./getExtension')

/**
 * setSuffix :: String -> String
 */
const setSuffix = (str, suffix) => `${str.slice(0, str.lastIndexOf('.'))}-${suffix}.${getExtension(str)}`

module.exports = setSuffix
