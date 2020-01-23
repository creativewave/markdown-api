
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

benchmark({
    name: 'into()',
    units: {
        current: () => into([], transducer, [...Array(100)].map((_, i) => i)),
        native: () => [...Array(100)].map((_, i) => i).reduce(reducer, []),
        nativeAlt: () => [...Array(100)].map((_, i) => i).map(increment).filter(isEven),
    },
})
