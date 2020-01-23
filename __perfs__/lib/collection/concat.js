
const benchmark = require('../../benchmark')
const concat = require('../../../lib/collection/concat')
const _concat = require('lodash/fp/concat')

const value = 1

benchmark({
    name: 'concat()',
    units: {
        current: () => concat([], value),
        lodash: () => _concat(value, []),
        native: () => [].concat([value]),
        // nativeSet: () => collection.add(value),
    },
})
