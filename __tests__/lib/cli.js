
const Result = require('folktale/result')
const rules = require('../../lib/command/rules')

const argv = ['/usr/bin/node', '/usr/bin/api.js']
const commands = {
    create: {
        description: 'Create command.',
        name: 'create',
    },
    help: {
        description: 'Output information to use command.',
        name: 'help',
    },
    remove: {
        description: 'Remove command.',
        name: 'remove',
    },
}
const parameters = {
    boolean: {
        definition: '-b, --boolean',
        description: 'Boolean parameter (automatic false default value and boolean type).',
    },
    camelCased: {
        default: 0,
        definition: '-c, --camel-cased <number>',
        description: 'Validated/processed parameter.',
        process: i => ++i,
        rules: [rules.isNotEmpty],
    },
    default: {
        default: 'default value',
        definition: '-d, --default <string>',
        description: 'Parameter with default value.',
    },
    depends: {
        default: true, // Required only w/ cli.parameter(Parameter)
        definition: '-D, --no-depends',
        description: 'Parameter that depends on another parameter input',
        process: (_, args) => args.some(([parameter, argument]) => parameter === 'boolean' && argument),
    },
    list: {
        definition: '-l, --list <...string>',
        description: 'Parameter with automatic coercion to Array',
    },
    required: {
        definition: '-r, --required <string>',
        description: 'Required parameter (no default value).',
    },
}
const invalidParameters = ['invalid', '--invalid', '-i--invalid', '-invalid --parameter']
const noop = () => {}
const safeRequireMock = path => {
    if (path.endsWith('api/create') || path.endsWith('api-create')) {
        command = require('../../lib/command')('api create', commands.create.description)
        command.help = jest.fn()
        command
            .action(actionArgs => args = actionArgs)
            .parse(argv.concat(['create', '-h']))
        return Result.Ok()
    } else if (path.endsWith('api/remove') || path.endsWith('api-remove')) {
        require('../../lib/command')('api remove', commands.remove.description)
            .parameter(parameters.camelCased)
            .action(actionArgs => args = actionArgs)
            .parse(argv.concat(['remove', '-c', '1']))
        return Result.Ok()
    } else if (path.endsWith('api.config')) {
        return Result.Ok(userConfigFile)
    }
    return Result.Error()
}
const userConfigFile = { force: true }

let args
let cli
let command
let error

// Memo: Jest should spy them before requiring `/lib/command`
jest.doMock('../../lib/console/logError', () => error = jest.fn(Result.Error))
jest.doMock('../../lib/module/require', () => safeRequireMock)

beforeEach(() => {
    args = []
    cli = require('../../lib/command')
    command = {}
})
afterEach(() => {
    jest.clearAllMocks()
})
afterAll(() => {
    jest.restoreAllMocks()
})

it('throws when the invoked command has no name', () =>
    expect(() => cli()).toThrow('A name is required to invoke a command.'))
it.each(invalidParameters)('throws when a parameter is registered with an invalid definition', definition =>
    expect(() =>
        cli('api')
            .parameter(definition)
            .parse(argv))
        .toThrow(`Invalid command parameter definition: ${definition}`))
it('throws when the invoked command has no action', () =>
    expect(() =>
        cli('api')
            .parameter('-a, --aaa <string>')
            .parse(argv))
        .toThrow('The "api" command has no action defined.'))
it('outputs an error when the invoked command is missing a required argument', () => {

    cli('api')
        .parameter(parameters.required)
        .action(noop)
        .parse(argv)

    expect(error).toHaveBeenCalledWith('--required is required.')
})
it('outputs an error when a command is invoked with an invalid argument', () => {

    cli('api')
        .parameter(parameters.camelCased)
        .action(noop)
        .parse(argv.concat('-c', ''))

    expect(error).toHaveBeenCalledWith('--camel-cased requires a non empty value.')
})
it('outputs an error when the invoked sub-command is missing a required argument', () => {

    cli('api')
        .command(commands.create.name, commands.create.description)
        .parameter(parameters.required)
        .action(noop)
        .parse(argv.concat('create'))

    expect(error).toHaveBeenCalledWith('--required is required.')
})
it('outputs an error when a sub-command is invoked with an invalid argument', () => {

    cli('api')
            .command(commands.create.name, commands.create.description)
            .parameter(parameters.camelCased)
            .action(noop)
            .parse(argv.concat('create', '-c', ''))

    expect(error).toHaveBeenCalledWith('--camel-cased requires a non empty value.')
})
it('calls command action with parsed/validated/processed input as arguments', () => {

    cli('api')
        .parameter(parameters.boolean)
        .parameter(parameters.camelCased)
        .parameter(parameters.default)
        .parameter(parameters.depends)
        .parameter(parameters.list)
        .action(actionArgs => args = actionArgs)
        .parse(argv.concat('-b', '-c', '1', '-l', 'foo,bar', '-D'))

    expect(args).toEqual({
        boolean: true,
        camelCased: 2,
        default: 'default value',
        depends: true,
        list: ['foo', 'bar'],
    })
})
it('calls sub-command action with parsed/validated/processed input as arguments', () => {

    cli('api')
        .command(commands.create.name, commands.create.description)
        .parameter(parameters.camelCased)
        .action(actionArgs => args = actionArgs)
        .command('remove', 'Remove command')
        .action(noop)
        .parse(argv.concat('create', '-c', '1'))

    expect(args).toEqual({ camelCased: 2 })
})
it('calls sub-command action from separated file with parsed/validated/processed input as arguments', () => {

    cli('api')
        .command(commands.remove.name, commands.remove.description)
        .parse(argv.concat('remove', '-c', '1'))

    expect(args).toEqual({ camelCased: 2 })
})
it('calls command action with boolean: false [def: --boolean][input: --no-boolean]', () => {

    cli('api')
        .parameter(parameters.boolean)
        .action(actionArgs => args = actionArgs)
        .parse(argv.concat('--no-boolean'))

    expect(args).toEqual({ boolean: false })
})
it.each([
    [false, 'no-'],
    [true, ''],
])('calls command action with boolean: %s [def: --no-boolean][input: --%sboolean]', (boolean, prefix) => {

    cli('api')
        .parameter('-n, --no-boolean', 'Negated boolean parameter name.')
        .action(actionArgs => args = actionArgs)
        .parse(argv.concat(`--${prefix}boolean`))

    expect(args).toEqual({ boolean })
})
it('calls command action with boolean: true [def: --no-boolean][input: default]', () => {

    cli('api')
        .parameter('-n, --no-boolean', 'Negated boolean parameter name.')
        .action(actionArgs => args = actionArgs)
        .parse(argv)

    expect(args).toEqual({ boolean: true })
})
it('calls command action with a parameter that uses default value from user config file', () => {

    cli('api')
        .parameter(require('../../lib/command/parameter').force)
        .action(actionArgs => args = actionArgs)
        .parse(argv)

    expect(args).toEqual({ force: true })
})
it('calls help command action [single command]', () => {

    command = cli('api', 'api CLI')
    command.help = jest.fn()
    command
        .parameter(parameters.boolean)
        .parameter(parameters.camelCased)
        .parameter(parameters.default)
        .parameter(parameters.required)
        .action(noop)
        .parse(argv.concat('-h'))

    expect(command.help).toHaveBeenCalledWith()
})
it('calls help command action for the root command [multiple command]', () => {

    command = cli('api', 'api CLI')
    command.help = jest.fn()
    command
        .command(commands.create.name, commands.create.description)
        .action(noop)
        .parse(argv.concat('-h'))

    expect(command.help).toHaveBeenCalledWith()
})
it('calls help command action for a sub-command [multiple command]', () => {

    command = cli('api', 'api CLI')
    command.help = jest.fn()
    command
        .command(commands.create.name, commands.create.description)
        .parameter(parameters.boolean)
        .action(noop)
        .parse(argv.concat(['create', '-h']))

    expect(command.help).toHaveBeenCalledWith(true)
})
it('calls help command action for a sub-command from separated file [multiple command]', () => {

    cli('api', 'api CLI')
        .command(commands.create.name, commands.create.description)
        .parse(argv.concat(['create', '-h']))

    expect(command.help).toHaveBeenCalledWith()
})
it('calls help command action when an undefined sub-command is invoked [multiple command]', () => {

    command = cli('api', 'api CLI')
    command.help = jest.fn()
    command
        .command('command', 'Command')
        .parse(argv.concat('undefined-command'))

    expect(command.help).toHaveBeenCalledWith(true)
})
