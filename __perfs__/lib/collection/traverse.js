
const benchmark = require('../../benchmark')
const traverse = require('../../../lib/collection/traverse')
const Maybe = require('folktale/maybe')

const createArray = () => [...Array(100)].map((_, i) => i)
const reducer = (m, v) => m.map(bs => b => ((bs.push(b), bs))).apply(Maybe.Just(v))

benchmark({
    name: 'traverse()',
    units: {
        current: () => traverse(Maybe, Maybe.Just, createArray()),
        native: () => createArray().reduce(reducer, Maybe.of([])),
    },
})
