
const assign = require('lodash/fp/assign')
const getEntry = require('../lib/entry/getEntry')
const logReject = require('../lib/console/logReject')
const setEntry = require('../lib/entry/setEntry')
const setProp = require('../lib/collection/setProp')
const slugify = require('../lib/slugify')

// TODO: implement `List` (Traversable and Monoid ADT for iterables)
// TODO: and/or implement transducer `toCompact` (eg. toCompact(List))
// TODO: and/or implement `removeUndefined` utility (to remove undefined values
//       from any iterable.
const compactEntity = entity => Object.keys(entity).reduce(
    (compacted, key) => entity[key] === undefined
        ? compacted
        : setProp(compacted, [key, entity[key]]),
    {})

/**
 * set :: Options -> Task Error Results
 */
const set = ({ name, src, type, ...entity }, slug = slugify(entity.title)) =>
    setEntry({ entity: assign({ slug }, compactEntity(entity)), ...getEntry(name, { src, type }) })
        .orElse(logReject('There was an error while trying to set entry'))

module.exports = set
