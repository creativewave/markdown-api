/**
 * Benchmark.js seems to be the most reliable tool to measure execution's time,
 * which involves dealing with complex runtime behaviors (warming, GC, etc...),
 * since it outputs totally different results than with `performance.now()` or
 * `console.time()` and `console.timeEnd()`.
 *
 * How to create/run a benchmark?
 *
 * 1. Create a file in `__perfs__/` that mirrors the unit module path.
 * 2. Import and execute `run()` (defined below) in this module.
 * 3. Run `node __perfs__/<path>/<fn>.js`
 */
const Benchmark = require('benchmark')

/**
 * run :: { name: String, units: { [version]: Unit } } -> void
 */
const run = ({ name, units }) => {

    const suite = new Benchmark.Suite(name)

    Object.entries(units)
        .reduce((suite, [name, unit]) => suite.add(name, () => unit()), suite)
        .on('start', () => console.group('\x1b[32m%s\x1b[0m', name))
        .on('cycle', event => console.log(String(event.target)))
        .on('complete', () => {
            console.log(`-> Fastest is ${suite.filter('fastest').map('name')}`)
            console.groupEnd(name)
        })
        .run()
}

module.exports = run
