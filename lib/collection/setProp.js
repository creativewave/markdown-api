
/**
 * setProp :: Collection -> [PropKey, PropValue] -> Collection
 *
 * This function is not pure and is meant to be used as a reducer to fold (push)
 * reduced value as a last step of a transduction, eg.:
 *
 * ```js
 *     const myObject = { foo: 1, bar: 1 }
 *     const incrementFooValue = prop => 'foo' === prop[0] ? [prop[0], prop[1] + 1] : prop
 *     transduce(mapReducer(incrementFooValue), setProp, {}, Object.entries(myObject)) // { foo: 2, bar: 1 }
 *
 *     const myArray = [0, 1, 2]
 *     const incrementThirdValue = prop => 2 === prop[0] ? [prop[0], prop[1] + 1] : prop
 *     transduce(mapReducer(incrementThirdValue), setProp, [], myArray) // [0, 1, 3]
 *
 *     const transduceToObject = (transducer, collection) => transduce(transducer, setProp, {}, collection)
 *     transduce(mapReducer(incrementFooValue), Object.entries(myObject)) // { foo: 2, bar: 1 }
 *
 *     const transduceToArray = (transducer, collection) => transduce(transducer, setProp, [], collection)
 *     transduce(mapReducer(incrementThirdValue), myArray) // [0, 1, 3]
 * ```
 *
 * This is a more performant alternative than using Semigroup `concat` (pull)
 * interface, and is similar to `Object.assign` (`concat` for objects), which
 * has the following signature:
 *
 * assign :: Collection -> Collection -> Collection
 * assign :: Collection -> [Collection] -> Collection
 *
 * TODO (refactoring): see if it must be seen as a private utility, as it is not
 * a pure function. It might be useless if some other utilty like `ramda/into`
 * or the less flexibles from above become available.
 */
const setProp = (collection, [key, value]) => {
    collection[key] = value
    return collection
}

module.exports = setProp
