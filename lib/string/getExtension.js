
/**
 * getExtension :: String -> String
 */
const getExtension = str => str.slice(str.lastIndexOf('.') + 1)

module.exports = getExtension
