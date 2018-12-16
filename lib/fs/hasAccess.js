
const fs = require('fs')
const { task } = require('folktale/concurrency/task')

/**
 * hasAccess :: Path -> Integer -> Task Error Path
 */
const hasAccess = (path, mode = fs.constants.F_OK) =>
    task(({ reject, resolve }) => fs.access(path, mode, error => error ? reject(error) : resolve(path)))

module.exports = hasAccess
