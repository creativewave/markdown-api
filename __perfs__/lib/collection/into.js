
const benchmark = require('../../benchmark')
const compose = require('lodash/fp/compose')
const filterReducer = require('../../../lib/collection/filterReducer')
const into = require('../../../lib/collection/into')
const mapReducer = require('../../../lib/collection/mapReducer')

const increment = i => ++i
const isEven = i => i % 2 === 0
const transducer = compose(mapReducer(increment), filterReducer(isEven))
const reducer = (collection, value) => {
    const incremented = increment(value)
    if (isEven(incremented)) {
        return collection.concat([incremented])
    }
    return collection
}

const createArray = () => [...Array(100)].map((_, i) => i)

benchmark({
    name: 'into()',
    units: {
        current: () => into([], transducer, createArray()),
        native: () => createArray().reduce(reducer, []),
        nativeAlt: () => createArray().map(increment).filter(isEven),
    },
})
