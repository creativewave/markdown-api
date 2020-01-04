
/**
 * get :: [Property] -> Configuration -> Configuration
 *
 * Configuration => { [Property]: Value }
 *
 * Memo: it prevents collecting internal props when destructuring `config` from
 * CommanderJS, especially when user input are used to be written on disk.
 *
 * Memo: using a whitelist is a better solution than inspecting CommanderJS
 * `program.options`, as the names of its props are probably considered as an
 * implementation detail that could change any time.
 */
const get = included => config => included.reduce((filtered, name) => ({ ...filtered, [name]: config[name] }), {})

module.exports = get
