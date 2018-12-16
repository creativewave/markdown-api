
const fs = require('fs')
const Task = require('folktale/concurrency/task')

/**
 * getDirectoryFilesNames :: Path -> Task Error [String]
 */
const getDirectoryFilesNames = Task.fromNodeback(fs.readdir)

module.exports = getDirectoryFilesNames
