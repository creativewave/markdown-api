
const compose = require('lodash/fp/compose')
const concat = require('../../lib/collection/concat')
const empty = require('../../lib/collection/empty')
const filterTask = require('../../lib/collection/filterTask')
const into = require('../../lib/collection/into')
const map = require('../../lib/collection/map')
const mapTask = require('../../lib/collection/mapTask')
const mapReducer = require('../../lib/collection/mapReducer')
const filterReducer = require('../../lib/collection/filterReducer')
const Task = require('folktale/concurrency/task')
const toCompact = require('../../lib/collection/toCompact')
const transduce = require('../../lib/collection/transduce')

const nextChar = char => String.fromCharCode(char.charCodeAt(0) + 1)
const increment = i => ++i
const lt = max => i => i < max

describe('empty()', () => {
    it('creates an empty representation of a given Array', () =>
        expect(empty(['foo'])).toEqual([]))
    it('creates an empty representation of a given Object', () =>
        expect(empty({ a: 1 })).toEqual({}))
    it('creates an empty representation of a given Map', () =>
        expect(empty(new Map([[1, 2]]))).toEqual(new Map()))
    it('creates an empty representation of a given Set', () =>
        expect(empty(new Set([1]))).toEqual(new Set()))
    it('creates an empty representation of a given Boolean', () => {
        expect(empty(true)).toEqual(true)
        expect(empty(false)).toEqual(true)
    })
    it('creates an empty representation of a given Number', () =>
        expect(empty(1)).toEqual(0))
    it('creates an empty representation of a given String', () =>
        expect(empty('Hello world')).toEqual(''))
})

describe('concat()', () => {
    it('appends a new value into an Array', () =>
        expect(concat([], 1)).toEqual([1]))
    it('appends a new value into an Object', () =>
        expect(concat({}, ['a', 1])).toEqual({ a: 1 }))
    it('appends a new value into a Map', () =>
        expect(concat(new Map(), ['a', 1])).toEqual(new Map([['a', 1]])))
    it('appends a new value into a Set', () =>
        expect(concat(new Set(), 1)).toEqual(new Set([1])))
    it('appends a new value into a Boolean', () => {
        expect(concat(true, true)).toEqual(true)
        expect(concat(true, false)).toEqual(false)
        expect(concat(false, false)).toEqual(false)
    })
    it('appends a new value into a Number', () =>
        expect(concat(-2, 5)).toEqual(3))
    it('appends a new value into a String', () =>
        expect(concat('Hello ', 'world')).toEqual('Hello world'))
})

describe('map()', () => {
    it('transforms a Collection that is an Array', () =>
        expect(map(increment, [1, 2])).toEqual([2, 3]))
    it('transforms a Collection that is an Object', () => {

        const object = { a: 1, b: 2 }
        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const actual = map(transform, object)
        const expected = { b: 2, c: 3 }

        expect(actual).toEqual(expected)
    })
    it('transforms a Collection that is a Map', () => {

        const record = new Map([['a', 1], ['b', 2]])
        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const actual = map(transform, record)
        const expected = new Map([['b', 2], ['c', 3]])

        expect(actual).toEqual(expected)
    })
    it('transforms a Collection that is a Set', () =>
        expect(map(increment, new Set([1, 2]))).toEqual(new Set([2, 3])))
    it('transforms a Collection that is a String', () =>
        expect(map(nextChar, 'enn')).toEqual('foo'))
})

describe('transduce()', () => {
    it('transforms and filters a Collection that is an Array', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(3)))
        const actual = transduce(transducer, [1, 2])
        const expected = [2]

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Collection that is an Object', () => {

        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const predicate = ([prop]) => prop === 'b'
        const transducer = compose(mapReducer(transform), filterReducer(predicate))

        const actual = transduce(transducer, { a: 1, b: 2 })
        const expected = { b: 2 }

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Collection that is a Map', () => {

        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const predicate = ([prop]) => prop === 'b'
        const transducer = compose(mapReducer(transform), filterReducer(predicate))

        const actual = transduce(transducer, new Map([['a', 1], ['b', 2]]))
        const expected = new Map([['b', 2]])

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Collection that is a Set', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(3)))
        const actual = transduce(transducer, new Set([1, 2]))
        const expected = new Set([2])

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Collection that is a String', () => {

        const predicate = char => char === 'o'
        const transducer = compose(mapReducer(nextChar), filterReducer(predicate))

        const actual = transduce(transducer, 'enn')
        const expected = 'oo'

        expect(actual).toEqual(expected)
    })
})

describe('mapTask()', () => {
    it('async transforms a Collection that is an Array', async () =>
        await mapTask(i => Task.of(increment(i)), [1, 2])
            .run()
            .promise()
            .then(actual => expect(actual).toEqual([2, 3])))
    it('async transforms a Collection that is an Object', async () =>
        await mapTask(([prop, value]) => Task.of([nextChar(prop), increment(value)]), { a: 1, b: 2 })
            .run()
            .promise()
            .then(actual => expect(actual).toEqual({ b: 2, c: 3 })))
})

describe('filterTask()', () => {
    it('async filters a Collection that is an Array', async () =>
        await filterTask(Task.of, [0, 1])
            .run()
            .promise()
            .then(actual => expect(actual).toEqual([1])))
    it('async filters a Collection that is an Object', async () =>
        await filterTask(entry => Task.of(entry[1]), { a: 0, b: 1 })
            .run()
            .promise()
            .then(actual => expect(actual).toEqual({ b: 1 })))
})

describe('into()', () => {
    it('transforms/filters/reduces an Array into a Number', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(4)))

        expect(into(0, transducer, [1, 2, 3])).toEqual(5)
    })
    it('transforms/filters/reduces an Object into a Number', () => {

        const transform = entry => increment(entry[1])
        const transducer = compose(mapReducer(transform), filterReducer(lt(4)))

        expect(into(0, transducer, { a: 1, b: 2, c: 3 })).toEqual(5)
    })
    it('transforms/filters/reduces an Map into a Number', () => {

        const transform = entry => increment(entry[1])
        const transducer = compose(mapReducer(transform), filterReducer(lt(4)))

        expect(into(0, transducer, new Map([['a', 1], ['b', 2], ['c', 3]]))).toEqual(5)
    })
    it('transforms/filters/reduces an Set into a Number', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(4)))

        expect(into(0, transducer, new Set([1, 2, 3]))).toEqual(5)
    })
    it('transforms/filters/reduces an String into a Number', () => {

        const transducer = compose(mapReducer(char => char.charCodeAt(0)), filterReducer(lt(100)))

        expect(into(0, transducer, 'bar')).toEqual(195)
    })
})

describe('toCompact()', () => {
    it('removes all falsey values from an Array', () => {

        const actual = toCompact([false, 0, undefined, null, NaN, '', 'not-empty'])
        const expected = ['not-empty']

        expect(actual).toEqual(expected)
    })
    it('removes all falsey values from an Object', () => {

        const actual = toCompact({
            a: false,
            b: 0,
            c: undefined,
            d: null,
            e: NaN,
            f: '',
            z: 'not-empty',
        })
        const expected = { z: 'not-empty' }

        expect(actual).toEqual(expected)
    })
    it('removes all falsey values from a Map', () => {

        const actual = toCompact(new Map([
            ['a', false],
            ['b', 0],
            ['c', undefined],
            ['d', null],
            ['e', NaN],
            ['f', ''],
            ['z', 'not-empty'],
        ]))
        const expected = new Map([['z', 'not-empty']])

        expect(actual).toEqual(expected)
    })
    it('removes all falsey values from a Set', () => {

        const actual = toCompact(new Set([false, 0, undefined, null, NaN, '', 'not-empty']))
        const expected = new Set(['not-empty'])

        expect(actual).toEqual(expected)
    })
})
