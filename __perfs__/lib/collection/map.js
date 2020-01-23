
const _map = require('lodash/fp/map')
const map = require('../../../lib/collection/map')
const benchmark = require('../../benchmark')

const transform = i => i++

benchmark({
    name: 'map()',
    units: {
        current: () => map(transform, [...Array(100)].map((_, i) => i)),
        lodash: () => _map(transform, [...Array(100)].map((_, i) => i)),
        native: () => [...Array(100)].map((_, i) => i).map(transform),
    },
})
