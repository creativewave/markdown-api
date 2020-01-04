
const native = ['debug', 'dir', 'error', 'info', 'log', 'table', 'time', 'timeEnd', 'timeLog', 'trace', 'warn']

const colors = {
    error:   '\x1b[31m%s\x1b[0m',
    info:    '\x1b[32m%s\x1b[0m',
    warning: '\x1b[34m%s\x1b[0m',
}

/**
 * log :: a? -> ...x -> [a?, ...x]
 *
 * It should unify all `console` methods in a single `log` method.
 *
 * It should return its args to allow debugging inside function compositions.
 *
 * It should use the first argument as the color label for coloring its output,
 * if it's registered in the list above.
 */
const log = (level, ...x) => {
    if ('test' === process.env.NODE_ENV) {
        return x[0] || level
    }
    if (0 === x.length) {
        return console.log('[markdown-api]:', level, '\n') || level
    }
    if (colors[level]) {
        return console.log(colors[level], '[markdown-api]:', ...x, '\n') || x
    }
    if (native[level]) {
        return console[level]('[markdown-api]:', ...x, '\n') || x
    }
    return console.log(level, '[markdown-api]:', ...x, '\n') || x
}

module.exports = log
