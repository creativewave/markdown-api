
const getHash = require('./string/getHash')
const into = require('./collection/into')
const mapReducer = require('./collection/mapReducer')
const prop = require('lodash/fp/prop')

/**
 * paginate :: [Entity] -> Configuration -> Pages
 *
 * Configuration => { hash: Boolean, limit: Number, offset: Number }
 * Pages => { [Page]: Page }
 * Page => { entities: [Entity], prev: URL, next: URL }
 *
 * Memo: always sort, then categorize, then paginate each category entities.
 */
const paginate = (entities, { hash, limit, offset = 1 }) => {

    const pages = {}
    const pagesCount = Math.ceil(entities.length / limit)

    for (; offset <= pagesCount; offset++) {
        pages[offset] = {
            entities: entities.slice((offset - 1) * limit, offset * limit),
            next: offset < pagesCount ? `page/${offset + 1}/` : '',
            prev: 1 < offset ? `page/${offset - 1}/` : '',
        }
        if (hash) {
            pages[offset].hash = getHash(into('', mapReducer(prop('hash')), pages[offset].entities))
        }
    }

    return pages
}

module.exports = paginate
