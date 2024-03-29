/** 
 * Checks a value is a boolean 
 * 
 * @param {any} value the tested value
 * @returns {boolean} 
 */
export function isBoolean(value){
    return typeof value === 'boolean' || value instanceof Boolean
}

/** 
 * Checks a value is a string
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isString(value){
    return typeof value == 'string' || value instanceof String
}

/** Checks a value if a number 
 * 
 * @param {any} value the tested value
 * @returns {boolean}
*/
export function isNumber(value){
    return typeof value == 'number' || value instanceof Number
}

/**
 * Checks a value is a date
 * @param {*} value 
 */
export function isDate(value){
    return value instanceof Date && isFinite(value)
}

/** Checks a value is defined
 * Undefined values are NaN, null, undefined, +/-Infinity
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isDefined(value){
    return !(value !== value 
        || value === undefined 
        || value === null 
        || value === Infinity || value === -Infinity 
    )
}

/** 
 * Checks a value is numeric
 * Numeric values are defined (see above) numbers and booleans
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isNumeric(value){
    return isDefined(value) && (isNumber(value) || isBoolean(value))
}

/**
 * Checks a value is non-numeric
 * This is stricter definition compared to isNaN or Number.isNaN
 * as it excludes null and Infinity
 * 
 * @param {any} value the tested value
 * @returns {boolean}
 */
export function isnan(value){
    return !isNumeric(value)
}

/**
 * Alias for isnan
 * 
 * @alias isnan
 */
export function isNaN(value){
    return isnan(value)
}

/**
 * Checks a value is not missing (not available)
 * 
 * @param {any} value 
 * @returns {boolean}
 */
export function isna(value){
    return !isDefined(value)
}

/**
 * Alias for isna
 * 
 * @alias isna
 */
export function isNA(value){
    return isna(value)
}

/**
 * Checks whether a value is not an object
 * 
 * @param {*} value the tested value
 * @returns {boolean}
 */
export function isPrimitive(value){
    return (
        isNumber(value) || isString(value) || isBoolean(value) 
        || value === null
        || value === undefined
        || value !== value
    )
}

/**
 * Checks whether a value is mappable
 * 
 * @param {*} value the tested value
 * @returns {boolean}
 */
export function ismappable(value){
    try{
        return value.map !== undefined && typeof value.map === "function" 
    }
    catch{
        return false
    }
}

/**
 * Checks whether value is a list of lists
 * 
 * @param {*} value the tested value
 * @returns {boolean}
 */
export function isListOfList(value){
    if(Array.isArray(value)){
        for(let i = 0, len = value.length; i < len; i++){
            if(!Array.isArray(value[i])){
                return false
            }
        }
        return true
    }
    return false
}

/**
 * Checks wether value is a list of list 
 * with the length of each equal to each other
 * 
 * @param {*} value 
 */
export function isMatrix(value){
    return isListOfList(value) && (value.length == 0 || value.every(item => item.length == value[0].length))
}


/**
 * Checks whether a value is a list of records
 * @param {*} value the tested value
 * @returns {boolean}
 */
export function isListOfRecords(value){
    if(Array.isArray(value)){
        for(let i = 0, len = value.length; i < len; i++){
            if(typeof value[i] !== "object"){
                return false
            }
        }
        return true
    }
    return false
}


/**
 * Create a range of integers
 */
export function range(start, end = undefined, step = 1){
    if(end == undefined) end = [start, start = 0][0]
    const arr = []
    for(let i = start; i < end; i = i + step){
        arr.push(i)
    }
    return arr
}

/**
 * Returns the transpose of a list of list
 * 
 * @param values uniform list of lists
 * @returns list of list
 */
export function transpose(values){
    return values.reduce((transpose, row) => {
        transpose.forEach((column, c) => column.push(row[c]))
        return transpose
    }, values[0].map(() => []))
}

/**
 * Sorting function between two values
 */
export function defaultsort(a, b, options){
    if((isNumeric(a) && isNumeric(b)) || (isString(a) && isString(b))){
        return a > b ? 1 : -1
    }
    if(isNumeric(a) && isString(b)){
        throw new Error(`TypeError: defaultsort comparison not supported between strings and numeric values (${a} & ${b})`)
    }
    if(isNA(a) || isNA(b)){
        if(isNA(a)) return (!options || options.na == "last") ? 1 : -1
        if(isNA(b)) return (!options || options.na == "last") ? -1 : 1
    }
    if(!isPrimitive(a) || !isPrimitive(b)){
        throw new Error(`TypeError: defaultsort comparison is only supported for primitive types (${a} & ${b})`)
    }
    return defaultsort(b, a) == 1 ? -1 : 1
}

/**
 * Checks wether an object is iterable
 */
export function isIterable(obj){
    if (obj == null) return false
    return typeof obj[Symbol.iterator] === 'function';
}

/**
 * 
 */
export function isSortable(a, b){
    if((isNumeric(a) && isNumeric(b)) || (isString(a) && isString(b))){
        return true
    }
    if(isNA(a) || isNA(b)){
        return true
    }
    return false
}