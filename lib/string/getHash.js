
const crypto = require('crypto')

/**
 * hash :: String -> String
 *
 * It should return a base64 hash truncated to 5 characters.
 */
const getHash = string => crypto.createHash('md4').update(string).digest('hex').slice(0, 6)

module.exports = getHash
