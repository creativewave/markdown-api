/**
 * TODO(feature: define ... resource type using schema)
 *
 * Related solutions:
 *   Normalizr: https://github.com/paularmstrong/normalizr/blob/master/docs/api.md#schema
 *   GraphQL: https://graphql.org/learn/schema/
 *   MongoDB: https://docs.mongodb.com/manual/core/data-modeling-introduction/
 *
 * The last two require installing a server package and use their own language.
 * But GraphQL is nicely declarative using types, and MongoDB is using _id as
 * a convention to link entities between them (ugly). Note also that MongoDB is
 * saving data as binary JSON (BSON) files.
 *
 * TODO(feature: define ... resource type using schema): check how MongoDB JSON
 * files are looking.
 *
 * A promise of this package is to support static sites as well as server side
 * rendered sites, by exporting data api as files, with a performant caching
 * solution using hashes in endpoints paths.
 *
 * Normalizr's mission is to normalize/denormalize data, not more. It doesn't
 * help defining AND reading a schema. It has to be specific to this package, to
 * what is required to define properties and relations of an entity.
 *
 * What do we need to define?
 *
 * Properties could be defined in entry/index.js. They will be appended to the
 * resulting entity, but it would not be processed as markdown, and it will not
 * be included in entity index.
 *
 * Relations could be defined in an entry/schema.js using a simple tree:
 *   module.exports = {
 *     relations: {
 *       IndexName: [EntityType],
 *       IndexName: [EntityType],
 *       ...,
 *     }
 *     indexes: [...properties keys of the entity to use in index],
 *     files: [{
 *       path: /path/to/file, // .md, .js, or .json
 *       key: 'EntityContentName', // Only required if .md (fields from .js and .json will be merged)
 *     }]
 *   }
 */
