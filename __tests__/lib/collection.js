
const chain = require('../../lib/collection/chain')
const compose = require('lodash/fp/compose')
const concat = require('../../lib/collection/concat')
const empty = require('../../lib/collection/empty')
const filter = require('../../lib/collection/filter')
const filterTask = require('../../lib/collection/filterTask')
const into = require('../../lib/collection/into')
const map = require('../../lib/collection/map')
const mapTask = require('../../lib/collection/mapTask')
const mapReducer = require('../../lib/collection/mapReducer')
const merge = require('../../lib/collection/merge')
const filterReducer = require('../../lib/collection/filterReducer')
const Task = require('folktale/concurrency/task')
const toCompact = require('../../lib/collection/toCompact')
const toFlat = require('../../lib/collection/toFlat')
const transduce = require('../../lib/collection/transduce')

const nextChar = char => String.fromCharCode(char.charCodeAt(0) + 1)
const increment = i => ++i
const lt = max => i => i < max
const nest = collection => {
    // eslint-disable-next-line no-prototype-builtins
    if (Set.prototype.isPrototypeOf(collection)) {
        return value => collection.add(value)
    }
    return value => collection.concat(value)
}
const swap = collection => {
    // eslint-disable-next-line no-prototype-builtins
    if (Map.prototype.isPrototypeOf(collection)) {
        return ([prop, value]) => collection.set(value, prop)
    }
    return ([prop, value]) => {
        collection[value] = prop
        return collection
    }
}

describe('empty()', () => {
    it('throws when it receives a Collection that is not a Monoid, an Iterable, a Number, or a Boolean', () =>
        expect(() => empty(Symbol())).toThrow('Unable to create an empty `symbol`'))
    it('creates an empty representation of a given Array', () =>
        expect(empty(['foo'])).toEqual([]))
    it('creates an empty representation of a given Set', () =>
        expect(empty(new Set([1]))).toEqual(new Set()))
    it('creates an empty representation of a given Object', () =>
        expect(empty({ a: 1 })).toEqual({}))
    it('creates an empty representation of a given Map', () =>
        expect(empty(new Map([[1, 2]]))).toEqual(new Map()))
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
    it('throws when it receives a Collection that is not a SemiGroup, an Iterable, a Number, or a Boolean', () =>
        expect(() => concat(Symbol(), 1)).toThrow('Unable to concatenate a value into a type `symbol`'))
    it('appends a new value into an Array', () =>
        expect(concat([], 1)).toEqual([1]))
    it('appends an Array into an Array', () =>
        expect(concat([], [1])).toEqual([[1]]))
    it('appends a new value into a Set', () =>
        expect(concat(new Set(), 1)).toEqual(new Set([1])))
    it('appends a new value into an Object', () =>
        expect(concat({}, ['a', 1])).toEqual({ a: 1 }))
    it('appends a new value into a Map', () =>
        expect(concat(new Map(), ['a', 1])).toEqual(new Map([['a', 1]])))
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
    it('transforms an Array', () =>
        expect(map(increment, [1, 2])).toEqual([2, 3]))
    it('transforms a Set', () =>
        expect(map(increment, new Set([1, 2]))).toEqual(new Set([2, 3])))
    it('transforms an Object', () => {

        const object = { a: 1, b: 2 }
        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const actual = map(transform, object)
        const expected = { b: 2, c: 3 }

        expect(actual).toEqual(expected)
    })
    it('transforms a Map', () => {

        const record = new Map([['a', 1], ['b', 2]])
        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const actual = map(transform, record)
        const expected = new Map([['b', 2], ['c', 3]])

        expect(actual).toEqual(expected)
    })
    it('transforms a String', () =>
        expect(map(nextChar, 'enn')).toEqual('foo'))
})

describe('filter()', () => {
    it('filters an Array', () =>
        expect(filter(lt(2), [1, 2])).toEqual([1]))
    it('filters a Set', () =>
        expect(filter(lt(2), new Set([1, 2]))).toEqual(new Set([1])))
    it('filters an Object', () =>
        expect(filter(([, value]) => lt(2)(value), { a: 1, b: 2 })).toEqual({ a: 1 }))
    it('filters a Map', () =>
        expect(filter(([, value]) => lt(2)(value), new Map([['a', 1], ['b', 2]]))).toEqual(new Map([['a', 1]])))
    it('filters a String', () =>
        expect(filter(char => char === 'o', 'foo')).toEqual('oo'))
})

describe('transduce()', () => {
    it('throws when it receives a Collection that is not a Foldable or an Iterable', () =>
        expect(() => transduce(mapReducer(x => x), true)).toThrow('Unable to transduce a `boolean`'))
    it('transforms and filters an Array', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(3)))
        const actual = transduce(transducer, [1, 2])
        const expected = [2]

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Set', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(3)))
        const actual = transduce(transducer, new Set([1, 2]))
        const expected = new Set([2])

        expect(actual).toEqual(expected)
    })
    it('transforms and filters an Object', () => {

        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const predicate = ([prop]) => prop === 'b'
        const transducer = compose(mapReducer(transform), filterReducer(predicate))

        const actual = transduce(transducer, { a: 1, b: 2 })
        const expected = { b: 2 }

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a Map', () => {

        const transform = ([prop, value]) => [nextChar(prop), increment(value)]
        const predicate = ([prop]) => prop === 'b'
        const transducer = compose(mapReducer(transform), filterReducer(predicate))

        const actual = transduce(transducer, new Map([['a', 1], ['b', 2]]))
        const expected = new Map([['b', 2]])

        expect(actual).toEqual(expected)
    })
    it('transforms and filters a String', () => {

        const predicate = char => char === 'o'
        const transducer = compose(mapReducer(nextChar), filterReducer(predicate))

        const actual = transduce(transducer, 'enn')
        const expected = 'oo'

        expect(actual).toEqual(expected)
    })
})

describe('mapTask()', () => {
    it('async transforms an Array', async () =>
        await mapTask(i => Task.of(increment(i)), [1, 2])
            .run()
            .promise()
            .then(actual => expect(actual).toEqual([2, 3])))
    it('async transforms an Object', async () =>
        await mapTask(([prop, value]) => Task.of([nextChar(prop), increment(value)]), { a: 1, b: 2 })
            .run()
            .promise()
            .then(actual => expect(actual).toEqual({ b: 2, c: 3 })))
})

describe('filterTask()', () => {
    it('async filters an Array', async () =>
        await filterTask(Task.of, [0, 1])
            .run()
            .promise()
            .then(actual => expect(actual).toEqual([1])))
    it('async filters an Object', async () =>
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
    it('transforms/filters/reduces a Set into a Number', () => {

        const transducer = compose(mapReducer(increment), filterReducer(lt(4)))

        expect(into(0, transducer, new Set([1, 2, 3]))).toEqual(5)
    })
    it('transforms/filters/reduces an Object into a Number', () => {

        const transform = entry => increment(entry[1])
        const transducer = compose(mapReducer(transform), filterReducer(lt(4)))

        expect(into(0, transducer, { a: 1, b: 2, c: 3 })).toEqual(5)
    })
    it('transforms/filters/reduces a Map into a Number', () => {

        const transform = entry => increment(entry[1])
        const transducer = compose(mapReducer(transform), filterReducer(lt(4)))

        expect(into(0, transducer, new Map([['a', 1], ['b', 2], ['c', 3]]))).toEqual(5)
    })
    it('transforms/filters/reduces a String into a Number', () => {

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
    it('removes all falsey values from a Set', () => {

        const actual = toCompact(new Set([false, 0, undefined, null, NaN, '', 'not-empty']))
        const expected = new Set(['not-empty'])

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
})

describe('merge()', () => {
    it('merges two Array', () =>
        expect(merge([1], [2, 3])).toEqual([1, 2, 3]))
    it('merges two Set', () =>
        expect(merge(new Set([1]), new Set([2, 3]))).toEqual(new Set([1, 2, 3])))
    it('merges two Object', () =>
        expect(merge({ a: 1, b: 2 }, { a: 2 })).toEqual({ a: 2, b: 2 }))
    it('merges two Map', () =>
        expect(merge(new Map([['a', 1], ['b', 2]]), new Map([['a', 2]]))).toEqual(new Map([['a', 2], ['b', 2]])))
})

describe('chain', () => {
    it('transforms then flatten an Array', () =>
        expect(chain(compose(nest([]), increment), [1])).toEqual([1].flatMap(compose(nest([]), increment))))
    it('transforms then flatten a Set', () =>
        expect(chain(compose(nest(new Set()), increment), new Set([1]))).toEqual(new Set([2])))
    it('transforms then flatten an Object', () =>
        expect(chain(swap({}), { a: 1 })).toEqual({ 1: 'a' }))
    it('transforms then flatten a Map', () =>
        expect(chain(swap(new Map()), new Map([['a', 1]]))).toEqual(new Map([[1, 'a']])))
})

describe('toFlat()', () => {
    it('transforms/filters then flatten an Array', () =>
        expect(toFlat(mapReducer(compose(nest([]), increment)), [1, 2])).toEqual([2, 3]))
    it('transforms/filters then flatten a Set', () =>
        expect(toFlat(mapReducer(compose(nest(new Set()), increment)), new Set([1, 2]))).toEqual(new Set([2, 3])))
    it('transforms/filters then flatten an Object', () =>
        expect(toFlat(mapReducer(swap({})), { a: 1 })).toEqual({ 1: 'a' }))
    it('transforms/filters then flatten a Map', () =>
        expect(toFlat(mapReducer(swap(new Map())), new Map([['a', 1]]))).toEqual(new Map([[1, 'a']])))
})
