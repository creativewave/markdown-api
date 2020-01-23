
const { basename, dirname } = require('path')
const camelCase = require('lodash/fp/camelCase')
const concat = require('../collection/concat')
const into = require('../collection/into')
const log = require('../console/log')
const logError = require('../console/logError')
const mapReducer = require('../collection/mapReducer')
const Result = require('folktale/result')
const safeRequire = require('../module/require')
const split = require('lodash/fp/split')
const transduce = require('../collection/transduce')

/**
 * getParameterMatch :: (String -> [Parameter]) -> Parameter
 */
const getParameterMatch = (input, parameters) =>
    parameters.find(parameter =>
        [`-${parameter.alias}`, `--${parameter.name}`, `--no-${parameter.name}`]
            .includes(input))

/**
 * parseDefinition :: String -> { alias: String, name: String }
 *
 * It should parse the definition of a `Parameter` to find its `alias`, `name`,
 * `type`, and eventually its `default` value if its a boolean parameter that
 * doesn't expect an input value.
 */
const parseDefinition = definition => {
    try {

        const regexp = /-(?<alias>[a-zA-Z]),?\s--(?<not>no-)?(?<name>[a-z-]{2,})( <(?<type>(...)?[a-z]+)>)?/
        const { groups: { alias, not, name, type } } = regexp.exec(definition)

        if (type) {
            return { alias, name, type }
        }
        return { alias, default: !!not, name, type: 'boolean' }

    } catch {
        throw Error(`Invalid command parameter definition: ${definition}`)
    }
}

/**
 * parseArguments :: [String] -> [Argument]
 *
 * Argument => [String, String|Boolean]
 *
 * Memo: `-a b z -c d` should result to `[['a', 'b'], ['c', 'd']]`, and `-a -b`
 * where `-a` isn't a boolean, should result to `[['a', '-b']]`.
 */
const parseArguments = (args, parameters) => {

    const parsed = []

    for (let i = 0, n = args.length; i < n; i++) {
        if (args[i].startsWith('-')) {

            const parameter = getParameterMatch(args[i], parameters)

            if (!parameter) {
                log('error', `Invalid parameter ${args[i]}`)
                continue
            } else if (typeof parameter.default === 'boolean') {
                parsed.push([parameter.name, !args[i].startsWith('--no-')])
            } else if (parameter.type.startsWith('...')) {
                parsed.push([parameter.name, split(',', args[++i])])
            } else {
                parsed.push([parameter.name, args[++i]])
            }
        }
    }

    return parsed
}

/**
 * validate :: (Argument -> [Rule] -> [Argument]) -> Result Error Argument
 *
 * Argument => [String, String|Boolean]
 */
const validate = (arg, rules, args) => rules.reduce(
    (result, validate) => result.chain(() => validate(arg, args)),
    Result.of(arg))

/**
 * command :: (String -> String) -> Command
 */
const command = (name, description) => {

    if (!name) {
        throw Error('A name is required to invoke a command.')
    }

    let action
    let currentCommandName

    const cli = {
        /**
         * action :: (ProcessedArguments -> void) -> Command
         *
         * ProcessedArguments => { [String]: a }
         */
        action(fn) {

            if (commands.has(currentCommandName)) {
                commands.get(currentCommandName).action = fn
            } else {
                action = fn
            }

            return cli
        },
        /**
         * command :: (String -> String -> (ProcessedArguments -> void) -> [Parameter]) -> Command
         */
        command(name, description, action, parameters = []) {

            commands.set(currentCommandName = name, { action, description, parameters })

            return cli
        },
        /**
         * help :: String -> void
         *
         * Memo: it's an action that can be invoked as a command or parameter.
         */
        help(showCommands = commands.size > 1) {
            console.log('\x1b[32m%s\x1b[0m', name, `- ${description}\n`)
            if (showCommands) {
                console.log(`Usage: ${name} <command> [parameter]\n`)
                console.group('Commands:')
                console.log(into(
                    '',
                    mapReducer(([name, { description }]) =>
                        `\n${name}${Array(10 - name.length).join(' ')}${description}`),
                    commands))
                console.groupEnd('Commands:')
            } else {
                console.log(`Usage: ${name} [parameter]\n`)
                console.group('Parameters:')
                console.log(into(
                    '',
                    mapReducer(({ definition, description }) =>
                        `\n${definition}${Array(40 - definition.length).join(' ')}${description}`),
                    parameters))
                console.groupEnd('Parameters:')
            }
            return cli
        },
        /**
         * parameter :: Parameter -> Command
         * parameter :: (String -> String? -> Boolean?|Number?|String?|Configuration?) -> Command
         *
         * Parameter => {
         *   ...Configuration,
         *   alias?: String,
         *   definition: String,
         *   description?: String,
         *   name?: String,
         *   type?: String,
         * }
         * Configuration => {
         *   default?: a,
         *   process?: (String|Boolean -> [Argument]) -> a,
         *   rules?: [Rule],
         * }
         * Argument => [String, String|Boolean]
         * Rule :: (String|Boolean -> [Argument]) -> Result Error Argument
         *
         * Memo: it wraps a default value into a `Configuration` only if it's a
         * `Boolean`, `Number`, `String`, or an `Array`.
         */
        parameter(definition, description, configuration = {}) {

            if (['boolean', 'number', 'string'].includes(typeof configuration) || Array.isArray(configuration)) {
                configuration = { default: configuration }
            }

            const parameter = typeof definition === 'string'
                ? { definition, description, ...parseDefinition(definition), ...configuration }
                : { ...definition, ...parseDefinition(definition.definition) }

            if (commands.has(currentCommandName)) {
                commands.get(currentCommandName).parameters.push(parameter)
            } else {
                parameters.push(parameter)
            }

            return cli
        },
        /**
         * parse :: [String] -> Command
         */
        parse(input) {

            // 1. Match <commandName> <subCommandName?> <...argsInput>
            const commandName = basename(input[1], '.js')
            const { argsInput, subCommandName = '' } =
                (input[2] && input[2].startsWith('-'))
                    ? { argsInput: input.slice(2) }
                    : { argsInput: input.slice(3), subCommandName: input[2] }
            const isCurrentCommand = `${commandName} ${subCommandName}`.trim() === name
            const command = isCurrentCommand ? { action, parameters } : commands.get(subCommandName)

            // 2. Load command (auto-run - step 3/4 - when required from module)
            if (!isCurrentCommand && command && !command.action) {
                try {
                    safeRequire(`${dirname(dirname(__dirname))}/bin/${commandName}-${subCommandName}`)
                        .orElse(() => safeRequire(`${dirname(dirname(__dirname))}/bin/${commandName}/${subCommandName}`))
                        .orElse(() => {
                            log('error', `Undefined command name ${subCommandName}`)
                            cli.help(true)
                        })
                } catch (error) {
                    logError(error)
                }
                return cli
            }

            // 3. Display help if invoked as a parameter or as an action's fallback
            if (argsInput.some(arg => ['-h', '--help'].includes(arg))) {
                return isCurrentCommand ? cli.help() : cli.help(true)
            } else if (!(command && command.action)) {
                if (commands.size > 1) {
                    return cli.help(true)
                }
                throw Error(`The "${name}" command has no action defined.`)
            }

            // 4. Run command action with filtered/validated/processed arguments name/value
            const args = parseArguments(argsInput, command.parameters)
            const result = transduce(
                mapReducer(({ default: defaultValue, name, process = x => x, rules }) => {
                    const arg = args.find(([arg]) => arg === name)
                    if (arg) {
                        return validate(arg, rules || [], args).map(() => [camelCase(name), process(arg[1], args)])
                    } else if (typeof defaultValue === 'undefined') {
                        return Result.Error(`--${name} is required.`)
                    }
                    return Result.Ok([camelCase(name), process(defaultValue, args)])
                }),
                command.parameters,
                Result.of({}),
                (result, argument) => result.chain(args => argument.map(arg => concat(args, arg))))

            result.orElse(logError).map(command.action)

            return cli
        },
    }
    const commands = new Map([['help', { action: cli.help, description: 'Output information to use command.' }]])
    const parameters = []

    return cli
}

module.exports = command
