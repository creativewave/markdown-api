
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * getFile :: Path -> Options? -> Task Error String
 */
const getFile = (path, { encoding = 'utf8', flag = 'r' } = {}) =>
    Task.fromNodeback(fs.readFile)(path, { encoding, flag })

module.exports = getFile
