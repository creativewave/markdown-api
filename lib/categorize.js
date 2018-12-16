
const slugify = require('./slugify')

/**
 * categorize :: [Entity] -> Indexes
 *
 * Indexes => { [IndexName]: [Entity] }
 *
 * Memo: always sort, then categorize, then paginate each category entities.
 */
const categorize = entities => entities.reduce((entitiesByCategory, entity) => {

    entity.categories.forEach(category => {

        const slug = slugify(category)

        if (!entitiesByCategory[slug]) {
            entitiesByCategory[slug] = []
        }
        entitiesByCategory[slug].push(entity)
    })

    return entitiesByCategory

}, entities.length > 0 ? { all: entities } : {})

module.exports = categorize
