
const curry = require('lodash/fp/curry')
const Maybe = require('folktale/maybe')

/**
 * safeProp :: String|Number|Symbol -> Object -> Maybe a
 */
const safeProp = curry((key, collection) => Maybe.fromNullable(collection[key]))

module.exports = safeProp
