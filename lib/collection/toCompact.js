
const concat = require('./concat')
const filterReducer = require('../lambda/filterReducer')
const transduce = require('../lambda/transduce')

/**
 * toCompact :: Object -> Object
 *
 * It removes all falsey values from an `Object`.
 *
 * TODO (refactoring): require a Monoid and Foldable as input value, and use it
 * to automatically define seed and fold arguments.
 */
const toCompact = collection =>
    transduce(filterReducer(([, value]) => value), concat, {}, Object.entries(collection))

module.exports = toCompact
