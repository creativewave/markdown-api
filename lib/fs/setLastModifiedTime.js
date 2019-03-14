
const fs = require('fs')
const Task = require('folktale/concurrency/task')

const getCurrentTime = () => {
    const today = new Date()
    today.setSeconds(today.getSeconds() + 1)
    return today
}

/**
 * setLastModifiedTime :: Path -> String -> Task Error Path
 *
 * Note: if not provided, last modified time will default to current time + 1s.
 * It can be used to handle a file which needs to have a last modified time
 * greater than another.
 */
const setLastModifiedTime = (file, mtime = getCurrentTime()) =>
    Task.fromNodeback(fs.utimes)(file, mtime, mtime).map(() => file)

module.exports = setLastModifiedTime
