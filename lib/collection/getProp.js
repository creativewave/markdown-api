
const curry = require('lodash/fp/curry')
const Maybe = require('folktale/maybe')

/**
 * getProp :: String|Number|Symbol -> Object -> Maybe a
 */
const getProp = curry((key, collection) => collection[key]
    ? Maybe.Just(collection[key])
    : Maybe.Nothing())

module.exports = getProp
