
// const compose = require('lodash/fp/compose')
// const Task = require('folktale/concurrency/task')

/**
 * get :: Configuration -> Task Error Any
 */
const get = () => 'Not implemented yet'

// `api get --type <type> [--name <name] [...--<field>]`          should output contents, eg.:
// -----------------------------------------------------------------------------
// `api get entry  --type <EntityType>`                            should return raw content of all <EntityType>
// `api get entry  --type <EntityType> --name <EntryName>`         should return raw content of <EntryName>
// `api get entry  --type <EntityType> --name <EntryName> --title` should return raw title of <EntryName>
// `api get entity --type <EntityType> --name <EntryName>`         should return processed content of <EntryName>
// `api get entity --type <EntityType> --name <EntryName> --index` should only return processed index content of <EntryName>
// `api get index  --type <EntityType> --name <IndexName>`         should return processed index contents of entries in <IndexName>

module.exports = get
