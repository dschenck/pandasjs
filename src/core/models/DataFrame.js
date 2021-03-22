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
            this._columns = data.length > 0 ? new Index(utils.range(data[0].length)) : new Index()
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
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    min(options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => stats.min(row), {index:this.index, name:"min"}))
        }
        return this.transpose().min({axis:1})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    max(options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => stats.max(row), {index:this.index, name:"max"}))
        }
        return this.transpose().max({axis:1})
    }
    
    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    mean(options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => stats.mean(row), {index:this.index, name:"mean"}))
        }
        return this.transpose().mean({axis:1})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    count(options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => stats.count(row, options), {index:this.index, name:"count"}))
        }
        return this.transpose().count({...options, axis:1})
    }

    /**
     * Returns the smallest value across an axis
     * @param {*} options 
     */
    sum(options){
        if(options && options.axis == 1){
            return new Series(this._values.map(row => stats.sum(row), {index:this.index, name:"sum"}))
        }
        return this.transpose().count({axis:1})
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