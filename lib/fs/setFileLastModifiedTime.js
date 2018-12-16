
const fs = require('fs')
const Task = require('folktale/concurrency/task')

const getCurrentTime = () => {
    const today = new Date()
    today.setSeconds(today.getSeconds() + 1)
    return today
}

/**
 * setFileLastModifiedTime :: Path -> String -> Task Error Path
 *
 * If not provided, the last modified time defaults to the current time + 1s. It
 * is usefull a file requires to have a last modified time greater than another.
 */
const setFileLastModifiedTime = (file, mtime = getCurrentTime()) =>
    Task.fromNodeback(fs.utimes)(file, mtime, mtime).map(() => file)

module.exports = setFileLastModifiedTime
