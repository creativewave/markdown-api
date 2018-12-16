
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * getStat :: Path -> Task Error Stat
 */
const getStat = Task.fromNodeback(fs.stat)

module.exports = getStat
