
const chain = require('../../../lib/collection/chain')
const benchmark = require('../../benchmark')

const transform = a => [a]

benchmark({
    name: 'chain()',
    units: {
        current: () => chain(transform, [...Array(100)].map((_, i) => i)),
        native: () => [...Array(100)].map((_, i) => i).flatMap(transform),
        nativeaAlt: () => [...Array(100)].map((_, i) => i).map(transform).flat(),
    },
})
