import stats from '../../core/stats'

test("base case", () => {
    const arr = [-10, 4, 8]
    expect(stats.first(arr)).toEqual(-10)
})

test("with booleans", () => {
    const arr = [true, -10, -4]
    expect(stats.first(arr)).toEqual(true)
    expect(stats.first(arr, {skipnan:true})).toEqual(true)
    expect(stats.first(arr, {skipnan:false})).toEqual(true)

    const alt = [false, -10, -4, false]
    expect(stats.first(alt)).toEqual(false)
    expect(stats.first(alt, {skipnan:false})).toEqual(false)
    expect(stats.first(alt, {skipnan:true})).toEqual(false)
})

test("mixed data types", () => {
    const arr = [NaN, "test", 1, 3, 5, "Hello", undefined, new Date(), {}]
    expect(stats.first(arr)).toEqual("test")
    expect(stats.first(arr, {skipnan:false})).toEqual("test")
    expect(stats.first(arr, {skipnan:true})).toEqual(1)
})

test("empty array", () => {
    const arr = []
    expect(stats.first(arr)).toEqual(NaN)
    expect(stats.first(arr, {skipnan:true})).toEqual(NaN)
    expect(stats.first(arr, {skipnan:false})).toEqual(NaN)
})

test("array with non-numeric values only", () => {
    const arr = ["David","Bob"]
    expect(stats.first(arr)).toEqual("David")
    expect(stats.first(arr, {skipnan:false})).toEqual("David")
    expect(stats.first(arr, {skipnan:true})).toEqual(NaN)
})
