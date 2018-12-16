
// const compose = require('lodash/fp/compose')
// const Task = require('folktale/concurrency/task')

/**
 * get :: Options -> Task Error Any
 */
const get = () => 'Not implemented yet'

// `api get --type <type> [--name <name] [...--<field>]`          should output contents, eg.:
// -----------------------------------------------------------------------------
// `api get entry  --type <EntryType>`                            should return raw content of all <EntryType>
// `api get entry  --type <EntryType> --name <EntryName>`         should return raw content of <EntryName>
// `api get entry  --type <EntryType> --name <EntryName> --title` should return raw title of <EntryName>
// `api get entity --type <EntryType> --name <EntryName>`         should return processed content of <EntryName>
// `api get entity --type <EntryType> --name <EntryName> --index` should only return processed index content of <EntryName>
// `api get index  --type <EntryType> --name <IndexName>`         should return processed index contents of entries in <IndexName>

module.exports = get
