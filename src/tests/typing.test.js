import * as utils from '../core/utils'

describe('Determine types', () => {
    test('as strings', ()=> {
        expect(utils.isstring('')).toBe(true)
        expect(utils.isstring(new String(''))).toBe(true)
        expect(utils.isstring('x')).toBe(true)
        expect(utils.isstring(new String('x'))).toBe(true)
        expect(utils.isstring(1)).toBe(false)
        expect(utils.isstring(0)).toBe(false)
        expect(utils.isstring(3/4)).toBe(false)
        expect(utils.isstring()).toBe(false)
        expect(utils.isstring(false)).toBe(false)
        expect(utils.isstring(true)).toBe(false)
        expect(utils.isstring(null)).toBe(false)
        expect(utils.isstring(NaN)).toBe(false)
        expect(utils.isstring(Infinity)).toBe(false)
        expect(utils.isstring(-Infinity)).toBe(false)
        expect(utils.isstring(undefined)).toBe(false)
        expect(utils.isstring({})).toBe(false)
        expect(utils.isstring({x:1})).toBe(false)
        expect(utils.isstring([])).toBe(false)
        expect(utils.isstring(["A","B"])).toBe(false)
    })
    test('as numbers', ()=> {
        expect(utils.isnumber('')).toBe(false)
        expect(utils.isnumber(new String(''))).toBe(false)
        expect(utils.isnumber('x')).toBe(false)
        expect(utils.isnumber(new String('x'))).toBe(false)
        expect(utils.isnumber(1)).toBe(true)
        expect(utils.isnumber(0)).toBe(true)
        expect(utils.isnumber(3/4)).toBe(true)
        expect(utils.isnumber(new Number(3.14))).toBe(true)
        expect(utils.isnumber(NaN)).toBe(true)
        expect(utils.isnumber(Infinity)).toBe(true)
        expect(utils.isnumber(-Infinity)).toBe(true)
        expect(utils.isnumber()).toBe(false)
        expect(utils.isnumber(false)).toBe(false)
        expect(utils.isnumber(true)).toBe(false)
        expect(utils.isnumber(null)).toBe(false)
        expect(utils.isnumber(undefined)).toBe(false)
        expect(utils.isnumber({})).toBe(false)
        expect(utils.isnumber({x:1})).toBe(false)
        expect(utils.isnumber([])).toBe(false)
        expect(utils.isnumber(["A","B"])).toBe(false)
    })
    test('as boolean', ()=> {
        expect(utils.isboolean('')).toBe(false)
        expect(utils.isboolean(new String(''))).toBe(false)
        expect(utils.isboolean('x')).toBe(false)
        expect(utils.isboolean(new String('x'))).toBe(false)
        expect(utils.isboolean(1)).toBe(false)
        expect(utils.isboolean(0)).toBe(false)
        expect(utils.isboolean(3/4)).toBe(false)
        expect(utils.isboolean(NaN)).toBe(false)
        expect(utils.isboolean(Infinity)).toBe(false)
        expect(utils.isboolean(-Infinity)).toBe(false)
        expect(utils.isboolean()).toBe(false)
        expect(utils.isboolean(false)).toBe(true)
        expect(utils.isboolean(true)).toBe(true)
        expect(utils.isboolean(null)).toBe(false)
        expect(utils.isboolean(undefined)).toBe(false)
        expect(utils.isboolean({})).toBe(false)
        expect(utils.isboolean({x:1})).toBe(false)
        expect(utils.isboolean([])).toBe(false)
        expect(utils.isboolean(["A","B"])).toBe(false)
    })
})

describe('test values for definition', () => {
    test('if value is determined', ()=> {
        expect(utils.isdefined('')).toBe(true)
        expect(utils.isdefined(new String(''))).toBe(true)
        expect(utils.isdefined('x')).toBe(true)
        expect(utils.isdefined(new String('x'))).toBe(true)
        expect(utils.isdefined(1)).toBe(true)
        expect(utils.isdefined(0)).toBe(true)
        expect(utils.isdefined(3/4)).toBe(true)
        expect(utils.isdefined()).toBe(false)
        expect(utils.isdefined(false)).toBe(true)
        expect(utils.isdefined(true)).toBe(true)
        expect(utils.isdefined(null)).toBe(false)
        expect(utils.isdefined(NaN)).toBe(false)
        expect(utils.isdefined(Infinity)).toBe(false)
        expect(utils.isdefined(-Infinity)).toBe(false)
        expect(utils.isdefined(undefined)).toBe(false)
        expect(utils.isdefined({})).toBe(true)
        expect(utils.isdefined({x:1})).toBe(true)
        expect(utils.isdefined([])).toBe(true)
        expect(utils.isdefined(["A","B"])).toBe(true)
    })
    test('if value is missing', ()=> {
        expect(utils.isNA('')).toBe(false)
        expect(utils.isNA(new String(''))).toBe(false)
        expect(utils.isNA('x')).toBe(false)
        expect(utils.isNA(new String('x'))).toBe(false)
        expect(utils.isNA(1)).toBe(false)
        expect(utils.isNA(0)).toBe(false)
        expect(utils.isNA(3/4)).toBe(false)
        expect(utils.isNA()).toBe(true)
        expect(utils.isNA(true)).toBe(false)
        expect(utils.isNA(false)).toBe(false)
        expect(utils.isNA(null)).toBe(true)
        expect(utils.isNA(NaN)).toBe(true)
        expect(utils.isNA(Infinity)).toBe(true)
        expect(utils.isNA(-Infinity)).toBe(true)
        expect(utils.isNA(undefined)).toBe(true)
        expect(utils.isNA({})).toBe(false)
        expect(utils.isNA({x:1})).toBe(false)
        expect(utils.isNA([])).toBe(false)
        expect(utils.isNA(["A","B"])).toBe(false)
    })
})


describe('test for numeric values', () => {
    test('if value is numeric', ()=> {
        expect(utils.isnumeric('')).toBe(false)
        expect(utils.isnumeric(new String(''))).toBe(false)
        expect(utils.isnumeric('x')).toBe(false)
        expect(utils.isnumeric(new String('x'))).toBe(false)
        expect(utils.isnumeric(1)).toBe(true)
        expect(utils.isnumeric(0)).toBe(true)
        expect(utils.isnumeric(3/4)).toBe(true)
        expect(utils.isnumeric()).toBe(false)
        expect(utils.isnumeric(true)).toBe(true)
        expect(utils.isnumeric(false)).toBe(true)
        expect(utils.isnumeric(null)).toBe(false)
        expect(utils.isnumeric(NaN)).toBe(false)
        expect(utils.isnumeric(Infinity)).toBe(false)
        expect(utils.isnumeric(-Infinity)).toBe(false)
        expect(utils.isnumeric(undefined)).toBe(false)
        expect(utils.isnumeric({})).toBe(false)
        expect(utils.isnumeric({x:1})).toBe(false)
        expect(utils.isnumeric([])).toBe(false)
        expect(utils.isnumeric(["A","B"])).toBe(false)
    })

    test('if value is non-numeric (not a number)', ()=> {
        expect(utils.isNaN('')).toBe(true)
        expect(utils.isNaN(new String(''))).toBe(true)
        expect(utils.isNaN('x')).toBe(true)
        expect(utils.isNaN(new String('x'))).toBe(true)
        expect(utils.isNaN(1)).toBe(false)
        expect(utils.isNaN(0)).toBe(false)
        expect(utils.isNaN(3/4)).toBe(false)
        expect(utils.isNaN()).toBe(true)
        expect(utils.isNaN(true)).toBe(false)
        expect(utils.isNaN(false)).toBe(false)
        expect(utils.isNaN(null)).toBe(true)
        expect(utils.isNaN(NaN)).toBe(true)
        expect(utils.isNaN(Infinity)).toBe(true)
        expect(utils.isNaN(-Infinity)).toBe(true)
        expect(utils.isNaN(undefined)).toBe(true)
        expect(utils.isNaN({})).toBe(true)
        expect(utils.isNaN({x:1})).toBe(true)
        expect(utils.isNaN([])).toBe(true)
        expect(utils.isNaN(["A","B"])).toBe(true)
    })
})

