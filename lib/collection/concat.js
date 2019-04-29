
const curry = require('lodash/fp/curry')

/**
 * concat :: Collection -> Entry -> Collection
 *
 * Collection => SemiGroup|Array
 * Entry => a|[Prop, a]
 * Prop => String|Symbol
 *
 * This function is meant to be used as the reducer argument of a transduction,
 * in order to fold reduced values as a last step of a transduction, eg.:
 *
 *   `transduce(mapReducer(double), concat, [], [1, 2])` // [2, 4]
 *   `transduce(mapReducer(reverse), concat, {}, Object.entries({ foo: 'bar' }))` // { bar: 'foo' }
 *
 * Memo: spread operator should be used to append new value(s) in an `Array` or
 * to set properties in an `Object`, as it's the most readable way to to that,
 * despite the few microseconds that could be saved by mutating the collection.
 */
const concat = curry((collection, entry) => {
    if (collection.concat) {
        return collection.concat(entry)
    }
    const [prop, value] = entry
    collection[prop] = value
    return collection
})

module.exports = concat
