
# Command Line Interface (CLI)

## Examples

**Single command and file:**

```js
// ./bin/api.js
const Result = require('folktale/result')
const isGt1 = arg => arg[1] > 1 ? Result.Ok(arg) : Result.Error(`--${arg[0]} should be > 1.`)
const configuration = {
    default: 1,
    process: i => ++i,
    rules: [isGt1],
}
const parameter = {
    default: 'foo',
    definition: '-p, --parameter <string>',
    description: 'Parameter (single argument)',
}

cli('api', 'Command description')
    .parameter('-b, --boolean', 'Boolean parameter')
    .parameter('-c, --camel-cased <typeHint>', 'Parameter with hyphenated name')
    .parameter('-d, --default <string>', 'Parameter with default value', 'default value')
    .parameter('-e, --example <number>', 'Parameter with configuration object', configuration)
    .parameter('-l, --list <...string>', 'Parameter with list as argument', [])
    .parameter(parameter)
    .action(args => console.log(args))
    .parse(process.argv)
```

`api --camel-cased ./src/ -e 1 -l foo,bar` will output `{ boolean: false, camelCased: './src/', default: 'default value', example: 2, list: ['foo', 'bar'], parameter: 'foo' }`.

`api ... -e 1` will throw error `--example should be > 1` (input value is validated then processed).

`api ...` will execute command action with `{ ..., example: 0 }` (default value is only processed).

**Multiple commands, single file:**

```js
// ./bin/api.js
cli('api', 'Command description (optional)')
    .command('create', 'Sub-command description (optional).')
    .parameter('-l, --list <...string>', 'Parameter with list as argument', [])
    .parameter('-n, --no-boolean', 'Negated boolean parameter')
    .action(args => create(args))
    .command('remove', 'Remove entry (optional description).')
    // .parameter(...)
    .action(args => remove(args))
    .parse(process.argv)
```

`api create` will execute `create()` with `{ boolean: true, list: [] }`.

**Multiple commands and files:**

The binary directory will be read to find `api-<subCommand>.js` or `api/<subCommand>.js` if no action has been registered for the current command.

```js
// ./bin/api.js
cli('api')
    .command('create')
    // .command(...)
    .parse(process.argv)

// ./bin/api-create.js (or ./bin/api/create.js)
cli('api create')
    .parameter('-b, --boolean', 'Boolean parameter')
    .parameter('-c, --camel-cased <typeHint>', 'Parameter with hyphenated name')
    .parameter('-d, --default <string>', 'Parameter with default value', 'default value')
    .parameter('-e, --example <number>', 'Parameter with configuration object', { process: i => ++i, rules: [isNumber] )
    .parameter(configuration)
    .action(args => create(args))
```

## Notes

A parameter is required if it doesn't expect an input value (boolean parameter) or if it has no input or default value.

A boolean parameter is:

| value   | if its definition is | and user input is |
| ------- | -------------------- | ----------------- |
| `true`  | `-b, --boolean`      | `-b`              |
| `true`  | `-b, --boolean`      | `--boolean`       |
| `true`  | `-n, --no-boolean`   | `--boolean`       |
| `true`  | `-n, --no-boolean`   | (none)            |
| `false` | `-n, --no-boolean`   | `-n`              |
| `false` | `-n, --no-boolean`   | `--no-boolean`    |
| `false` | `-b, --boolean`      | `--no-boolean`    |
| `false` | `-b, --boolean`      | (none)            |

A parameter alias should be 1 or 2 two characters long, therefore its name should be at least 3 characters long.

`<typeHint>` is required to:
- distinguish a boolean parameter from other parameters that expect an input value
- automatically `split(',')` an input value (eg. `foo,bar,baz`) whose type hint starts with `...` (eg. `<...list>`)
- validate and/or process an input value of a parameter based on its type hint
- hint the user about the expected input type
