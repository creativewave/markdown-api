
const fs = require('fs')
const { task } = require('folktale/concurrency/task')

/**
 * hasAccess :: Path -> Integer -> Task Error Path
 *
 * Note: it is not recommended to use this function to check file permissions
 * before reading, writing, or removing it. Permissions errors should be handled
 * using on error callback when trying to read, write, or remove a file.
 */
const hasAccess = (path, mode = fs.constants.F_OK) =>
    task(({ reject, resolve }) => fs.access(path, mode, error => error ? reject(error) : resolve(path)))

module.exports = hasAccess
