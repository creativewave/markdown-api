
/**
 * paginate :: [Entity] -> Number -> Number -> Pages
 *
 * Pages => { [Page]: Page }
 * Page => { entities: [Entity], prev: URL, next: URL }
 *
 * Memo: always sort, then categorize, then paginate each category entities.
 */
const paginate = (entities, limit, offset = 1) => {

    const pages = {}
    const pagesCount = Math.ceil(entities.length / limit)

    for (; offset <= pagesCount; offset++) {
        pages[offset] = {
            entities: entities.slice((offset - 1) * limit, offset * limit),
            next: offset < pagesCount ? `page/${offset + 1}/` : '',
            prev: 1 < offset ? `page/${offset - 1}/` : '',
        }
    }

    return pages
}

module.exports = paginate
