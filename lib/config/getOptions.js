
const assign = require('lodash/fp/assign')

/**
 * getOptions :: [OptionName] -> Options -> Options
 *
 * Options => { [OptionName]: OptionValue }
 *
 * Memo: it prevents collecting internal properties/values when destructuring
 * CommanderJS `options` to collect user input data to be written on disk.
 *
 * Memo: using a whitelist is a better solution than inspecting CommanderJS
 * `program.options`, as the names of its properties are probably considered as
 * an implemntation detail that could change any time.
 */
const getOptions = included => options =>
    included.reduce((filteredOptions, name) => assign({ [name]: options[name] }, filteredOptions), {})

module.exports = getOptions
