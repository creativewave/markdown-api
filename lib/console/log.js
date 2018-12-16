/* eslint-disable no-console */

const native = ['debug', 'dir', 'error', 'info', 'log', 'table', 'time', 'timeEnd', 'timeLog', 'trace', 'warn']

const colors = {
    error:   '\x1b[31m%s\x1b[0m',
    info:    '\x1b[32m%s\x1b[0m',
    warning: '\x1b[34m%s\x1b[0m',
}

/**
 * log :: a? -> ...x -> [a?, ...x]
 *
 * It unifies `console` methods in a single `log` method, and return its args to
 * easily output data in a function composition pipeline, for debugging purpose,
 * or to easily insert time markers to measure performance.
 *
 * It also extends colors used by the native `console` methods. It will use the
 * first argument as the color label for its output, if registered in the list
 * above.
 */
const log = (level, ...x) => {
    if ('test' === process.env.NODE_ENV) {
        return
    }
    if (0 === x.length) {
        return console.log(level) || level
    }
    if (colors[level]) {
        return console.log(colors[level], ...x) || x
    }
    if (native[level]) {
        return console[level](...x) || x
    }
    return console.log(level, ...x) || x
}

module.exports = log
