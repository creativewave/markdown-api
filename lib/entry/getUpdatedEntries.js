
const compose = require('lodash/fp/compose')
const filterTask = require('../collection/filterTask')
const getDirectoryFilesStats = require('../fs/getDirectoryFilesStats')
const getLastModifiedTime = require('../fs/getLastModifiedTime')
const getLastModifiedTimes = require('../fs/getLastModifiedTimes')
const map = require('../collection/map')
const max = require('lodash/fp/max')
const prop = require('lodash/fp/prop')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryLastModifiedTime :: Path -> Task Number
 */
const getDirectoryLastModifiedTime = dir => getDirectoryFilesStats(dir).map(compose(max, map(prop('mtime'))))

/**
 * getUpdatedEntries :: [Entry] -> Task Error [Entry]
 *
 * It should throw if `srcIndex`, `srcContent`, or `srcExcerpt` doesn't exist.
 * It should not throw if `srcStatic` or `distStatic` doesn't exist.
 * It should set `entry.hasEntityUpdate` (see below).
 * It should set `entry.hasIndexUpdate` (see below).
 * It should set `entry.hasStaticDirUpdate` (see below).
 * It should filter out unmodified entries.
 *
 * An entry `hasEntityUpdate` if `index.js` or `content.md` have been updated.
 * An entry `hasIndexUpdate` if `index.js` or `excerpt.md` have been updated.
 * An entry `hasStaticDirUpdate` if `static/` isn't missing, empty, or if it has
 * a new, updated, or removed file.
 */
const getUpdatedEntries = (entries, config) =>
    filterTask(
        entry => Task.waitAll([
            getLastModifiedTimes([entry.srcIndex, entry.srcContent, entry.srcExcerpt]),
            (config.hash ? getDirectoryLastModifiedTime(entry.dist) : getLastModifiedTime(entry.distIndex))
                .orElse(() => Task.of(0)),
            getDirectoryLastModifiedTime(entry.srcStatic),
            getDirectoryLastModifiedTime(entry.distStatic).orElse(() => Task.of(0)),
        ]).map(([[index, content, excerpt], dist, srcStatic, distStatic]) => {

            const hasEntityUpdate    = Boolean(index > dist || content > dist)
            const hasIndexUpdate     = Boolean(index > dist || excerpt > dist)
            const hasStaticDirUpdate = Boolean(srcStatic && distStatic && srcStatic > distStatic)

            if (hasEntityUpdate || hasIndexUpdate || hasStaticDirUpdate) {

                entry.hasEntityUpdate = hasEntityUpdate
                entry.hasIndexUpdate = hasIndexUpdate
                entry.hasStaticDirUpdate = hasStaticDirUpdate

                return true
            }

            return false
        }),
        entries)

module.exports = getUpdatedEntries
