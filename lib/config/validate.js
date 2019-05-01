
const hasRequired = require('./hasRequired')

/**
 * validate :: [a] -> {a: b} -> Task Error {a: b}
 *
 * TODO(refactoring): use {a: [Rule]} as the first parameter, where `Rule` is a
 * function like `hasRequired`, and iterate over all rules.
 */
const validate = (required, config) =>
    required.slice(1).reduce(
        (result, param) => result.chain(() => hasRequired(config, param)),
        hasRequired(config, required[0]))

module.exports = validate
