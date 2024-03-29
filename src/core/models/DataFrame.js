import * as utils from '../utils'
import stats      from '../stats'
import Index      from './Index'
import Series     from './Series'

export default class DataFrame{
    constructor(data, options){
        if(data instanceof DataFrame){
            this._values  = data.values
            this._index   = data.index
            this._columns = data.columns
        }
        else if(data instanceof Series){
            this._values  = data._values.map(v => [v])
            this._index   = data.index
            this._columns = data.name !== undefined ? new Index([data.name]) : new Index([0])
        }
        else if(data instanceof Index){
            this._values  = data._values.map(v => [v])
            this._index   = data
            this._columns = data.name !== undefined ? new Index([data.name]) : new Index([0])
        }
        else if(utils.isMatrix(data)){
            this._values  = data.length == 0 ? [] : data.map(row => [...row])
            this._index   = new Index(utils.range(data.length))
            this._columns = data.length > 0 ? new Index(utils.range(data[0].length)) : new Index(options && options.columns || [])
        }
        else if(Array.isArray(data) && data.every(item => item instanceof Series)){
            this._index   = new Index(data.map((srs, i) => srs.name || i))
            this._columns = Index.union(data.map(srs => srs.index))
            this._values  = data.map(srs => {
                return this._columns.values.map(c => srs.index.has(c) ? srs.loc(c) : NaN)
            })
        }
        else if(Array.isArray(data)){
            this._values  = data.map(v => [v])
            this._index   = new Index(utils.range(data.length))
            this._columns = new Index(data.length > 0 ? [0]: [])
        }
        else if(data === undefined || data != data || data == null){
            if(options){
                if(options.index && options.columns){
                    this._values = utils.range(options.index.length).map(r => {
                        return utils.range(options.columns.length).map(v => NaN)
                    })
                }
                this._index   = new Index(options.index)
                this._columns = new Index(options.columns)
            }
            else{
                this._values  = []
                this._index   = new Index()
                this._columns = new Index()
            }
        }
        else if(utils.isPrimitive(data)){
            if(options && options.index && options.columns){
                this._values = utils.range(options.index.length).map(r => {
                    return utils.range(options.columns.length).map(v => utils.isNA(data) ? NaN : data)
                })
                this._index   = new Index(options.index)
                this._columns = new Index(options.columns)
            }
            else{
                throw new Error("Constructor not called properly")
            }
        }
        else{ 
            throw new Error("Constructor not called properly")
        }

        if(options && options.index){
            this.index = options.index
        }
        if(options && options.columns){
            this.columns = options.columns
        }
    }

    /**
     * Returns a tuple of number of rows, number of columns
     */
    get shape(){
        return [this.index.length, this.columns.length]
    }

    /**
     * Returns the index
     */
    get index(){
        return this._index
    }

    /**
     * Sets a new index
     */
    set index(index){
        if(index.length !== this.shape[0]){
            throw new Error(`Length mismatch: received ${index.length}, expected ${this.shape[0]}`)
        }
        this._index = new Index(index)
    }

    /**
     * Returns the columns index
     */
    get columns(){
        return this._columns
    }

    /**
     * Sets the columns index
     */
    set columns(index){
        if(index.length !== this.shape[1]){
            throw new Error(`Length mismatch: received ${index.length}, expected ${this.shape[1]}`)
        }
        this._columns = new Index(index)
    }

    /**
     * Get the dataframe values as a list of list
     */
    get values(){
        if(this.shape[0] == 0) return []
        return this._values.map(row => [...row])
    }

    /**
     * Renames index labels
     * 
     * @param {*} labels array || function || Map || object
     * @param {*} options object
     */
    rename(labels, options){
        if(options && options.axis == 1){
            if(Array.isArray(labels)){
                return new DataFrame(this, {index:this.index, columns:labels})
            }
            if(typeof labels == "function"){
                return new DataFrame(this, {index:this.index, columns:this.columns.map(labels)})
            }
            if(labels instanceof Map){
                return new DataFrame(this, {index:this.index, columns:this.columns.map(v => labels.has(v) ? labels.get(v) : v)})
            }
            return new DataFrame(this, {index:this.index, columns:this.columns.map(v => v in labels ? labels[v] : v)})
        }
        if(Array.isArray(labels)){
            return new DataFrame(this, {index:labels, columns:this.columns})
        }
        if(typeof labels == "function"){
            return new DataFrame(this, {index:this.index.map(labels), columns:this.columns})
        }
        if(labels instanceof Map){
            return new DataFrame(this, {index:this.index.map(v => labels.has(v) ? labels.get(v) : v), columns:this.columns})
        }
        return new DataFrame(this, {index:this.index.map(v => v in labels ? labels[v] : v), columns:this.columns})
    }

    assign(values, options){
        if(options && options.axis == 1){
            
        }
        if(options && options.name){
            if(this.columns.has(options.name)){
                //update column
            }
            else{
                //insert column
            }
        }
    }

    /**
     * Retrieve data by label(s)
     * @param {*} options 
     */
    loc(options){
        if(arguments.length == 2){
            if(this.index.has(arguments[0]) && this.columns.has(arguments[1])){
                return this.loc({row:arguments[0], column:arguments[1]})
            }
            throw new Error(".loc called incorrectly")
        }
        if(options.row && options.column){
            return this._values[this.index.loc(options.row)][this.columns.loc(options.column)]
        }
        if(options.row && options.columns){
            return new Series([...options.columns].map(c => {
                return this._values[this.index.loc(options.row)][this.columns.loc(c)]
            }), {name:options.row, index:options.columns})
        }
        if(options.row){
            return new Series(this._values[this.index.loc(options.row)], 
                {index:this.columns, name:options.row})
        }
        if(options.rows && options.column){
            return new Series([...options.rows].map(r => {
                return this._values[this.index.loc(r)][this.columns.loc(options.column)]
            }), {name:options.column, index:options.rows})
        }
        if(options.rows && options.columns){
            return new DataFrame([...options.rows].map(r => {
                return [...options.columns].map(c => this._values[this.index.loc(r)][this.columns.loc(c)])
            }), {index:options.rows, columns:options.columns})
        }
        if(options.rows){
            return new DataFrame([...options.rows].map(r => {
                return [...this._values[this.index.loc(r)]]
            }), {index:options.rows, columns:this.columns})
        }
        if(options.columns){
            return new DataFrame(this._values.map(row => {
                return [...options.columns].map(c => row[this.columns.loc(c)])
            }), {index:this.index, columns:options.columns})
        }
        if(options.column){
            return new Series(this._values.map(row => row[this.columns.loc(options.column)]), 
                {name:options.column, index:this.index})
        }
    }

    /**
     * 
     * @param {*} index 
     * @param {*} column 
     * @returns 
     */
    iat(index, column){
        if(index >= this.shape[0] || column >= this.shape[1]){
            throw new Error(`Out of range: DataFrame is ${this.shape[0]}x${this.shape[1]}, ${index}x${column} given`)
        }
        return this._values[index][column]
    }
    /**
     * 
     * @param {*} index 
     * @param {*} column 
     * @returns 
     */
    at(index, column){
        return this._values[this.index.loc(index)][this.columns.loc(column)]
    }

    /**
     * Retrieve data by position(s)
     * @param {*} options 
     */
    iloc(options){
        if(arguments.length == 2){
            if(utils.isNumber(arguments[0]) && utils.isNumber(arguments[1])){
                return this.iloc({row:arguments[0], column:arguments[1]})
            }
            throw new Error(".iloc called incorrectly")
        }
        if("row" in options){
            if(options.row < 0) options.row = this.shape[0] + options.row
            if(options.row >= this.shape[0]) throw new Error("Out of range")
        }
        if("column" in options){
            if(options.column < 0) options.column = this.shape[1] + options.column
            if(options.column >= this.shape[1]) throw new Error("Out of range")
        }
        if("row" in options && "column" in options){
            return this._values[options.row][options.column]
        }
        if("row" in options && "columns" in options){
            return new Series([...options.columns].map(c => this.iloc({row:options.row, column:c})), 
                {name:this.index.at(options.row), index:this.columns.iloc(options.columns)})
        }
        if("row" in options){
            return new Series(this._values[options.row], 
                {index:this.columns, name:this.index.at(options.row)})
        }
        if("rows" in options && "column" in options){
            return new Series(options.rows.map(r => this.iloc({row:r, column:options.column})),
                {name:this.columns.at(options.column), index:this.index.iloc(options.rows)})
        }
        if("rows" in options && "columns" in options){
            return new DataFrame(options.rows.map(r => {
                return options.columns.map(c => this.iloc({row:r, column:c}))
            }), {index:this.index.iloc(options.rows), columns:this.columns.iloc(options.columns)})
        }
        if("rows" in options){
            return new DataFrame(options.rows.map(r => {
                return utils.range(this.shape[1]).map(c => this.iloc({row:r, column:c}))
            }), {index:this.index.iloc(options.rows), columns:this.columns})
        }
        if("columns" in options){
            return new DataFrame(utils.range(this.shape[0]).map(r => {
                return options.columns.map(c => this.iloc({row:r, column:c}))
            }), {index:this.index, columns:this.columns.iloc(options.columns)})
        }
        if("column" in options){
            return new Series(this._values.map(row => row[options.column]), 
                {index:this.index, name:this.columns.at(options.column)})
        }
    }

    /**
     * 
     * @param {*} start 
     * @param {*} stop 
     * @param {*} options 
     */
    slice(start, stop, options){
        if(options && options.axis == 1){
            const columns = this.columns.slice(start, stop)
            const values  = this._values.map(row => {
                return row.filter((v, i) => columns.has(this.columns.at(i)))
            })
            return new DataFrame(values, {index:this.index, columns:columns})
        }
        const index  = this.index.slice(start, stop)
        const values = this._values.filter((row, i) => {
            return index.has(this.index.at(i))
        })
        return new DataFrame(values, {index:index, columns:this.columns})
    }

    /**
     * Slice by position
     * 
     * @param {*} start 
     * @param {*} stop 
     * @param {*} options 
     */
    islice(start, stop, options){
        if(options && options.axis == 1){
            if(start > this.columns.length || (this.columns.length + start) < 0){
                throw new Error('Out of bounds error')
            }
            if(stop && (stop > this.columns.length || (this.columns.length + stop) < 0)){
                throw new Error('Out of bounds error')
            }
            const values = this._values.map(row => row.slice(start, stop))
            return new DataFrame(values, {index:this.index, columns:this.columns.islice(start, stop)})
        }
        if(start > this.index.length || (this.index.length + start) < 0){
            throw new Error('Out of bounds error')
        }
        if(stop && (stop > this.index.length || (this.index.length + stop) < 0)){
            throw new Error('Out of bounds error')
        }
        const values = this._values.slice(start, stop)
        return new DataFrame(values, {index:this.index.islice(start, stop), columns:this.columns})
    }

    /**
     * Returns the row or columns at the largest label lower or equal to the
     * given label 
     * 
     * @param {*} label 
     * @param {*} options 
     * @returns 
     */
    asof(label, options){
        if(options && options.axis == 1){
            return this.loc({column:this.columns.asof(label)})
        }
        return this.loc({row:this.index.asof(label)})
    }

    /**
     * Reindexes the dataframe with another index
     * 
     * @param {*} index 
     * @param {*} options 
     * @returns 
     */
    reindex(index, options){
        if(options && options.axis == 1){
            return this.transpose().reindex(index, {...options, axis:0}).transpose()
        }
        const values = [...index].map((label, i, index) => {
            if(this.index.has(label)){
                return this._values[this.index.loc(label)]
            }
            if(options && options.fillna == "ffill"){
                try{
                    if(i == 0 || this.index.asof(label) > index[i-1]){
                        return this.asof(label)._values
                    }
                }   
                catch(err){
                    return utils.range(this.shape[1]).map(v => NaN)
                }
                return utils.range(this.shape[1]).map(v => NaN)
            }
            return utils.range(this.shape[1]).map(v => options && options.fillna || NaN)
        })
        return new DataFrame(values, {index:index, columns:this.columns})
    }

    /**
     * Returns a copy
     */
    copy(){
        return new DataFrame(this)
    }

    /**
     * Returns the transpose of the dataframe
     */
    transpose(){
        return new DataFrame(utils.transpose(this._values), {index:this.columns, columns:this.index})
    }

    /**
     * Maps each value of the dataframe
     * 
     * @param {*} callback 
     */
    map(callback){
        return new DataFrame(this._values.map(row => row.map(callback)), 
            {index:this.index, columns:this.columns})
    }
    
    /**
     * Returns the absolute value of the numeric types
     */
    abs(){
        return this.map(value => utils.isNaN(value) ? NaN : Math.abs(value))
    }

    /**
     * Returns the negative value of the numeric types
     */
    neg(){
        return this.map(value => utils.isNaN(value) ? NaN : -value)
    }

    /**
     * Returns the boolean inverse of each value
     */
    not(){
        return this.map(value => !value)
    }

    /**
     * Returns a boolean series flagging non-numeric types
     * 
     * @returns {Series}
     */
    isNaN(){
        return this.map((value) => utils.isNaN(value))
    }

    /**
     * Returns a boolean series flagging missing values
     * 
     * @returns {Series}
     */
    isNA(){
        return this.map((value) => utils.isNA(value))
    }

    /**
     * Reduces each column/row to a single value
     * 
     * @param {*} callback 
     * @param {*} options 
     */
    reduce(callback, options){
        if(options && options.axis == 1){
            if(options.raw){
                return new Series(
                    this._values.map((row, i) => callback(row, i)), 
                    {index:this.index, name:options.name}
                )
            }
            return new Series(
                this._values.map((row, i) => {
                    return callback(new Series(row, {index:this.columns, name:this.index.at(i)}), i)
                }), 
                {index:this.index, name:options.name}
            )
        }
        return this.transpose().reduce(callback, {...options, axis:1})
    }

    /**
     * 
     * @param {*} options 
     */
    all(options){
        return this.reduce(values => stats.all(values), {...options, raw:true})
    }

    /**
     * 
     * @param {*} options 
     */
    any(options){
        return this.reduce(values => stats.any(values), {...options, raw:true})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    min(options){
        return this.reduce(values => stats.min(values), {...options, raw:true})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    max(options){
        return this.reduce(values => stats.max(values), {...options, raw:true})
    }
    
    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    mean(options){
        return this.reduce(values => stats.mean(values), {...options, raw:true})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    count(options){
        return this.reduce(values => stats.count(values), {...options, raw:true})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    sum(options){
        return this.reduce(values => stats.sum(values), {...options, raw:true})
    }

    /**
     * Returns the variance
     * @param {*} options 
     */
    var(options){
        return this.reduce(values => stats.variance(values, {ddof:options.ddof || 1}), {...options, raw:true})
    }

    /**
     * 
     * @param {*} options 
     */
    std(options){
        return this.reduce(values => stats.std(values, {ddof:options.ddof || 1}), {...options, raw:true})
    }

    /**
     * 
     */
    mdd(options){
        return this.reduce(values => stats.mdd(values), {...options, raw:true})
    }

    /**
     * Combine this DataFrame with another value, array, Series, matrix or other DataFrame
     * with a callback function 
     * 
     * @param {*} other 
     * @param {*} callback 
     * @param {*} options 
     * @returns 
     */
    combine(other, callback, options){
        if(utils.isPrimitive(other)){
            return this.map(value => callback(value, other))
        }
        if(other instanceof DataFrame){
            if(options && options["ignore axis"]){
                if(this.shape[0] != other.shape[0] || this.shape[1] != other.shape[1]){
                    throw new Error("DataFrames need to be of equal size")
                }
                const values = this._values.map((row, r) => {
                    return row.map((cell, c) => callback(cell, other._values[r][c]))
                })
                return new DataFrame(values, {index:this.index, columns:this.columns})
            }
            const index   = [...this.index.union(other.index)]
            const columns = [...this.columns.union(other.columns)]
            const values  = index.map(idx => {
                if(this.index.has(idx) && other.index.has(idx)){
                    return columns.map(col => {
                        if(this.columns.has(col) && other.columns.has(col)){
                            return callback(this.at(idx, col), other.at(idx, col))
                        }
                        return NaN
                    })
                }
                return utils.range(columns.length).map(v => NaN)
            })
            return new DataFrame(values, {index:index, columns:columns})
        }
        if(utils.isMatrix(other)){
            if(this.shape[0] != other.length || this.shape[1] != other[0].length){
                throw new Error(`Size mismatch: DataFrame is ${this.shape[0]}x${this.shape[1]}, matrix is ${other.length}x${other[0].length}`)
            }
            const values = this._values.map((row, r) => {
                return row.map((cell, c) => callback(cell, other._values[r][c]))
            })
            return new DataFrame(values, {index:this.index, columns:this.columns})
        }
        if(Array.isArray(other)){
            if(options && options.axis == 1){
                if(this.shape[1] != other.length){
                    throw new Error(`Size mismatch: DataFrame is ${this.shape[0]}x${this.shape[1]}, array is ${other.length}`)
                }
                const values = this._values.map((row => {
                    return row.map((value, c) => callback(value, other[c]))
                }))
                return new DataFrame(values, {index:this.index, columns:this.columns})
            }
            else{
                if(this.shape[0] != other.length){
                    throw new Error(`Size mismatch: DataFrame is ${this.shape[0]}x${this.shape[1]}, array is ${other.length}`)
                }
                const values = this._values.map((row, r) => {
                    return row.map(value => callback(value, other[r]))
                })
                return new DataFrame(values, {index:this.index, columns:this.columns})
            }
        }
        if(other instanceof Series){
            if(options && options.axis == 1){
                if(options["ignore axis"]){
                    if(this.shape[1] != other.length){
                        throw new Error(`Size mismatch: rows are ${this.shape[1]} long, series is ${other.length}`)
                    }
                    const values = this._values.map((row => {
                        return row.map((value, c) => callback(value, other._values[c]))
                    }))
                    return new DataFrame(values, {index:this.index, columns:this.columns})
                }
                const columns = [...this.columns.union(other.index)]
                const values  = [...this.index].map((idx, i) => {
                    return columns.map(col => {
                        if(this.columns.has(col) && other.index.has(col)){
                            return callback(this.at(idx, col), other.at(col))
                        }
                        return NaN
                    })
                })
                return new DataFrame(values, {index:this.index, columns:columns}) 
            }
            else{
                if(options && options["ignore axis"]){
                    if(this.shape[0] != other.length){
                        throw new Error(`Size mismatch: columns are ${this.shape[0]} high, series is ${other.length}`)
                    }
                    const values = this._values.map((row, r) => {
                        return row.map(value => callback(value, other._values[r]))
                    })
                    return new DataFrame(values, {index:this.index, columns:this.columns})
                }
                const index   = [...this.index.union(other.index)]
                const columns = [...this.columns]
                const values  = index.map((idx, i) => {
                    if(this.index.has(idx) && other.index.has(idx)){
                        return columns.map(col => callback(this.at(idx, col), other.at(idx)))
                    }
                    return columns.map(col => NaN)
                })
                return new DataFrame(values, {index:index, columns:this.columns})
            }
        }
        if(other instanceof Index){
            return this.combine(Series(other), callback, options)
        }
    }

    /**
     * 
     * @param {*} other 
     * @param {*} options 
     * @returns 
     */
    add(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) ? NaN : a + b, options)
    }

    subtract(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) ? NaN : a - b, options)
    }

    multiply(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) ? NaN : a * b, options)
    }

    divide(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) || b == 0 ? NaN : a / b, options)
    }

    pow(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) ? NaN : Math.pow(a, b), options)
    }

    mod(other, options){
        return this.combine(other, (a, b) => utils.isNaN(a) || utils.isNaN(b) ? NaN : Math.mod(a, b), options)
    }

    equals(other, options){
        return this.combine(other, (a, b) => a == b, options) 
    }

    ne(other, options){
        return this.combine(other, (a, b) => a != b, options) 
    }

    gt(other, options){
        return this.combine(other, (a, b) => a > b, options) 
    }

    gte(other, options){
        return this.combine(other, (a, b) => a >= b, options) 
    }

    lt(other, options){
        return this.combine(other, (a, b) => a < b, options) 
    }

    lte(other, options){
        return this.combine(other, (a, b) => a <= b, options) 
    }

    and(other, options){
        return this.combine(other, (a, b) => (a == true) && (b == true), options) 
    }

    or(other, options){
        return this.combine(other, (a, b) => (a == true) || (b == true), options) 
    }
    
    /**
     * 
     * @param {*} options 
     */
    dropna(options){
        const mask = (options && options.how) == "all" ? this.isNA().all({axis:options && options.axis || 0}) : this.isNA().any({axis:options && options.axis || 0})
        
        if(options && options.axis == 1){
            return new DataFrame(
                this._values.filter((v, i) => mask.iloc(i)), 
                {index:this.index.mask(mask), columns:this.columns}
            )
        }
        return new DataFrame(
            this._values.map(row => row.filter((v, i) => mask.iloc(i))),
            {index:this.index, columns:this.columns.mask(mask)}
        )
    }

    /**
     * 
     * @param {*} options 
     */
    dropnan(options){
        const mask = (options && options.how) == "all" ? this.isNaN().all({axis:options && options.axis || 0}) : this.isNaN().any({axis:options && options.axis || 0})
        
        if(options && options.axis == 1){
            return new DataFrame(
                this._values.filter((v, i) => mask.iloc(i)), 
                {index:this.index.mask(mask), columns:this.columns}
            )
        }
        return new DataFrame(
            this._values.map(row => row.filter((v, i) => mask.iloc(i))),
            {index:this.index, columns:this.columns.mask(mask)}
        )
    }

    /**
     * 
     */
    iterrows(){
        return this._values.map((row, r) => {
            return new Series(row, {name:this.index.at(r), index:this.columns})
        })
    }


}