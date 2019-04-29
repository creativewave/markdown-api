
const concat = require('./concat')

/**
 * concatTask :: Task Error Object -> Task Error [a, b] -> Object
 *
 * Object => { [a]: b }
 */
const concatTask = (collection, entry) =>
    collection.and(entry).map(([c, e]) => concat(c, e))

module.exports = concatTask
