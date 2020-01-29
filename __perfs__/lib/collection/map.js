
const _map = require('lodash/fp/map')
const _mapValues = require('lodash/fp/mapValues')
const map = require('../../../lib/collection/map')
const benchmark = require('../../benchmark')

const transformValue = i => ++i
const transformEntry = e => [e[0], ++e[1]]
const reduceEntry = (o, e) => {
    o[e[0]] = transformValue(e[1])
    return o
}

const createArray = () => [...Array(100)].map((_, i) => i)
const createObject = () => createArray().reduce((o, i) => ({ ...o, [`prop-${i}`]: i }), {})

benchmark({
    name: 'map(transform, Array)',
    units: {
        current: () => map(transformValue, createArray()),
        lodash: () => _map(transformValue, createArray()),
        native: () => createArray().map(transformValue),
    },
})

benchmark({
    name: 'map(transform, Object)',
    units: {
        current: () => map(transformEntry, createObject()),
        lodash: () => _mapValues(transformValue, createObject()),
        native: () => Object.entries(createObject()).reduce(reduceEntry, {}),
    },
})
