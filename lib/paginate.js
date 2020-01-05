
const getHash = require('./string/getHash')

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
            pages[offset].hash = getHash(pages[offset].entities.reduce((hash, entity) => `${hash}${entity.hash}`, ''))
        }
    }

    return pages
}

module.exports = paginate
