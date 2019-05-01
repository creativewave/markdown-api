
const compose = require('lodash/fp/compose')
const getDirectoryFilesStats = require('../fs/getDirectoryFilesStats')
const getLastModifiedTimes = require('../fs/getLastModifiedTimes')
const map = require('../lambda/map')
const max = require('lodash/fp/max')
const prop = require('lodash/fp/prop')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryLastModifiedTime :: Path -> Task Number
 */
const getDirectoryLastModifiedTime = dir =>
    getDirectoryFilesStats(dir)
        .map(compose(max, map(prop('mtime'))))
        .orElse(() => Task.of(+Infinity))

/**
 * reduceEntry :: Task Error [Entry] -> Entry -> Task Error [Entry]
 *
 * It should filter out unmodified entries.
 * It should set `entry.hasEntryUpdate` (see below).
 * It should set `entry.hasIndexUpdate` (see below).
 * It should set `entry.hasStaticDirUpdate` (see below).
 * It should asynchronously iterate over each entry a single time.
 *
 * An entry should get `hasEntityUpdate: true` if `index.js` or `content.md`
 * have been updated.
 * An entry should get `hasIndexUpdate: true` if `index.js` or `excerpt.md` have
 * been updated.
 * An entry should get `hasStaticDirUpdate: false` if `static` directory is
 * missing, empty, or if it has no new, modified, or removed file.
 */
const reduceEntry = hasHash => (task, entry) => task.and(Task.waitAll([
    hasHash
        ? getLastModifiedTimes([entry.srcIndex, entry.srcContent, entry.srcExcerpt])
            .and(getDirectoryLastModifiedTime(entry.dist))
            .map(times => times.flat())
        : getLastModifiedTimes([entry.srcIndex, entry.srcContent, entry.srcExcerpt, entry.distIndex]),
    getDirectoryLastModifiedTime(entry.srcStatic),
    getDirectoryLastModifiedTime(entry.distStatic),
]))
    .map(([updated, [[index, content, excerpt, dist], srcStatic, distStatic]]) => {

        const hasEntityUpdate    = index > dist || content > dist
        const hasIndexUpdate     = index > dist || excerpt > dist
        const hasStaticDirUpdate = srcStatic ? distStatic ? srcStatic > distStatic : true : false

        if (hasEntityUpdate || hasIndexUpdate || hasStaticDirUpdate) {
            entry.hasEntityUpdate = hasEntityUpdate
            entry.hasIndexUpdate = hasIndexUpdate
            entry.hasStaticDirUpdate = hasStaticDirUpdate
            updated.push(entry)
        }

        return updated
    })

/**
 * getUpdatedEntries :: [Entry] -> Task Error [Entry]
 */
const getUpdatedEntries = (entries, options) =>
    entries.reduce(reduceEntry(options.hash), Task.of([]))

module.exports = getUpdatedEntries
