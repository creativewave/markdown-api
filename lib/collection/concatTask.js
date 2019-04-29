
const concat = require('./concat')

/**
 * concatTask :: Object -> Task -> Object
 */
const concatTask = (collection, task) => task.and(entry => concat(collection, entry))

module.exports = concatTask
