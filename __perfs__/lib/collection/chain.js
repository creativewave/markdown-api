
const chain = require('../../../lib/collection/chain')
const benchmark = require('../../benchmark')

const transform = a => [a]
const createArray = () => [...Array(100)].map((_, i) => i)

benchmark({
    name: 'chain()',
    units: {
        current: () => chain(transform, createArray()),
        native: () => createArray().flatMap(transform),
        nativeaAlt: () => createArray().map(transform).flat(),
    },
})
