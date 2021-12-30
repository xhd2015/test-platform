console.log('loading ObjectUtils')

class ConvertUtils {

    static toType(obj, type) {
        if (type == null || obj == null || obj.constructor === type) {
            return obj
        }
        // number,string, boolean,date promises convert
        if (type === Number || type === String || type === Boolean || type === Date) {
            return type(obj)
        }
        // fastjson is durable, it permits the elements remain string while the target type is integer
        if (type === Array) {
            return StringUtils.splitString(String(obj))
        }
        if (type === Object) {
            if (obj.constructor !== String) {
                return obj
            }
            return JsonUtils.evaluateObject(obj)
        }
    }
}

class ObjectWrapper {
    constructor(o) {
        if (o == null || o.constructor !== Object) {
            throw "Target object is not an Object"
        }
        this.object = o
    }

    unwrap() {
        return this.object
    }

    getProp(p) {
        return this.object[p]
    }

    setProp(p, v) {
        this.object[p] = v
        return this
    }

    exportExcel(name) {
        // TODO
        return this
    }

    /**
     *
     * @param f  function(value,key,index) -> a new wrapper, with this bind
     * @return ObjectWrapper
     */
    filter(f) {

    }

    map() {

    }


    toEntries() {
        return ObjectUtils.toEntries(this.object)
    }

    get() {

    }
}

class ObjectUtils {
    constructor() {

    }

    static toEntries(o) {
        if (o == null) {
            return []
        }
        let arr = []
        for (let k in o) {
            arr.push({key: k, value: o[k]})
        }
        return arr
    }

    static fromEntries(arr) {
        let o = {}
        for (let k of arr) {
            o[k.key] = k.value
        }
        return o
    }

    static foreach(o, f) {
        if (o == null) {
            return
        }
        for (let k in o) {
            f(k, o[k])
        }
    }

    static map(o, f) {
        if (o == null) {
            return null
        }
        if (o.constructor === Object) {
            let x = {}
            let i = 0
            for (let k in o) {
                x[k] = f(o[k], k, i++)
            }
            return x
        } else {
            return o.map(f)
        }
    }

    static filter(o, f) {
        if (o == null) {
            return null
        }
        if (o.constructor === Object) {
            let x = {}
            let i = 0
            for (let k in o) {
                if (f(o[k], k, i++)) {
                    x[k] = o[k]
                }
            }
            return x
        } else {
            return o.filter(f)
        }
    }

    static filterKey(o, keySet) {
        let x = {}
        for (let k of keySet) {
            if (k in o) {
                x[k] = o[k]
            }
        }
        return x
    }

    static filterKeyPrefix(o, s) {
        let x = {}
        for (let k in o) {
            if (k.startsWith(s)) {
                x[k] = o[k]
            }
        }
        return x
    }

    static keys(o) {
        return Object.keys(o)
    }

    static values(o) {
        return Object.values(o)
    }

    static toEntries(o) {
        if (o == null) {
            return []
        }
        let arr = []
        for (let k in o) {
            arr.push({key: k, value: o[k]})
        }
        return arr
    }

    static fromEntries(arr) {
        let o = {}
        for (let k of arr) {
            o[k.key] = k.value
        }
        return o
    }

    static convert(arr, typeMap) {
        return arr.map(e => ObjectUtils.convertObject(e, typeMap))
    }


    static partition(arr, size) {
        let iterations = Math.ceil(this.length / size)
        let data = []
        for (let i = 0; i < iterations; i++) {
            data.push([])
        }
        arr.forEach((e, idx) => data[Math.floor(idx / 100)].push(e))

        return data
    }


    /**
     * convert the specified simple type to another simple type
     * @param o
     * @param typeMap  {...}, including String,Boolean,Number,Date
     */
    static convertObject(o, typeMap) {
        let r = {}
        for (let k in o) {
            let tp = typeMap[k]
            if (tp != null) {
                r[k] = ConvertUtils.toType(o[k], tp)
            } else {
                r[k] = o[k]
            }
        }
        return r
    }

    static wrap(o) {
        if (o == null) {
            return null
        }
        if (o.constructor === Object) {
            return new ObjectWrapper(o)
        } else if (o.constructor === Array) {
            let arr = []
            for (let e of o) {
                arr.push(ObjectUtils.wrap(e))
            }
            return arr
        } else {
            return o
        }
    }

    static unwrap(o) {
        if (o == null) {
            return null
        }
        if (o.constructor === ObjectWrapper) {
            return o.unwrap()
        } else if (o.constructor === Array) {
            let arr = []
            for (let e of o) {
                arr.push(ObjectUtils.unwrap(e))
            }
            return arr
        } else {
            return o
        }
    }


    static splitNumber(s, split) {
        if (s == null) return null
        return s.split(split || ",").map((e) => Number(e))
    }

    static count(s, c) {
        if (s == null) return 0
        if (c == null || c === "") return -1
        let i = 0
        let count = 0
        while (i < s.length) {
            i = s.indexOf(c, i)
            if (i === -1) break
            ++count
            ++i
        }
        return count
    }

    static unique(array) {
        array.sort()
        let j = 0
        for (let i = 1; i < array.length; ++i) {
            if (array[i] !== array[j]) {
                array[++j] = array[i]
            }
        }
        if (j + 1 < array.length) array.splice(j + 1)
        return array
    }

    /**
     * return a function filter(include only) given keys
     * @param keys either a comma separated string or a list
     */
    static keysOf(keys) {
        if (keys == null) return function (o) {
            return null;
        }
        if (keys.constructor === String) keys = keys.split(",")
        return function (o) {
            if (o == null) return null
            let c = {}
            for (let k of keys) {
                if (k in o) {
                    c[k] = o[k]
                }
            }
            return c
        }
    }

    static keysNot(keys) {
        if (keys == null) return function (o) {
            return o
        }
        if (keys.constructor === String) keys = keys.split(",")
        keys = new Set(keys)
        return function (o) {
            if (o == null) return null
            let c = {}
            for (let k in o) {
                if (!keys.has(k)) {
                    c[k] = o[k]
                }
            }
            return c
        }
    }

    static enhanceObject(o) {
        if (!o) return o
        if (o.constructor === String) return o

        if (o.constructor === Array) {
            ObjectUtils._bindPropertyIfNotExists(o, "map", ObjectUtils.map)
            ObjectUtils._bindPropertyIfNotExists(o, "filter", ObjectUtils.filter)
            ObjectUtils._bindPropertyIfNotExists(o, "each", ObjectUtils.foreach)
        } else {
            ObjectUtils._bindPropertyIfNotExists(o, "keys", ObjectUtils.keys)
            ObjectUtils._bindPropertyIfNotExists(o, "values", ObjectUtils.values)
            ObjectUtils._bindPropertyIfNotExists(o, "map", ObjectUtils.map)
            ObjectUtils._bindPropertyIfNotExists(o, "filter", ObjectUtils.filter)
            ObjectUtils._bindPropertyIfNotExists(o, "each", ObjectUtils.foreach)
        }
        return o
    }

    static _bindPropertyIfNotExists(o, prop, val) {
        if (prop in o) {
            return
        }
        o[prop] = function(){
            return val(o,...arguments)
        }
    }

         static loadCode(______){
	        // protect contextual code from being modified by the code
	      if(______){
	          return eval('(' + ______ + ')')  // ______ is code
              }
	      return null
	 }
	 static loadCodeWithContext(context,______){ // ______ is code
	        // code can visit context,but no other names is available
		if(______) {
	           return eval('(' + ______ + ')')
		}
		 return null
	 }
	 static callFunc(______){ // ______ is {func,args} ,args is an array
	     return (______.func)(...(______.args))
	 }
}


class TypeUtils {

    static createObjecType(typeMap) {
        return {
            type: 'ObjectType',
            typeMap
        }
    }

    static createMapType(keyType, elementType) {
        return {
            type: 'MapType',
            keyType,
            elementType
        }
    }

    static createEnumType(options) {
        return {
            type: 'EnumType',
            options
        }
    }

    static createArrayType(elementType) {
        return {
            type: 'ArrayType',
            elementType
        }
    }

}


// requires  xlsx.full.min.js,
// see https://github.com/SheetJS/sheetjs
class ExcelUtils {

    /**
     * return an array of object read from excel
     */
    static loadExcel(binContent) {
        var workbook = XLSX.read(binContent, {
            type: 'binary' // 'array' is also possible
        });
        let sheet = workbook.Sheets[workbook.SheetNames[0]]
        return XLSX.utils.sheet_to_json(sheet, {raw: true})
    }

    /**
     * save an array of object to excel
     * @param arrOfObject
     */
    static toExcel(arrOfObject, file) {
        /* create a new blank workbook */
        var wb = XLSX.utils.book_new();
        let data = XLSX.utils.json_to_sheet(arrOfObject)
        /* Add the worksheet to the workbook */
        XLSX.utils.book_append_sheet(wb, data, "sheet");
        /* output format determined by filename */
        XLSX.writeFile(wb, file);
    }
}

/**
 * use Object.defineProperty will define getter on it
 * a local cache
 */
class ObjectCache {

    /**
     * {
     *     name:{
     *         loader(args){
     *
     *         },
     *         uriLoader: 'template'
     *         expireAfter:seconds // set to undefined will never expire, negative values are invalid
     *     }
     * }
     * @param config
     */
    constructor(name, config) {
        if (!name) {
            throw "Requires name"
        }
        this.config = Object.assign({}, config)
        this.name = name
        this.storagePrefix = '__cache_' + this.name + "_"

        for (let k in config) {
            let cfg = config[k]
            if (cfg.expireAfter != null) {
                if (cfg.expireAfter <= 0) {
                    throw "Invalid expireAfter settings for " + k
                }
                if (cfg.loader == null && cfg.uriLoader == null) {
                    throw "Requires either loader or uriLoader for " + k
                }
            }
        }
    }

    getValue(name, args) {
        if (!(name in this.config)) {
            throw "This key " + name + " is never declared in this cache"
        }
        let storageKey = this._getStorageKey(name, args)
        let val = localStorage.getItem(storageKey)
        if (val == null) {
            return this.loadValue(name, args, storageKey)
        }
        let now = new Date().getTime() / 1000
        let valInfo = JSON.parse(val)
        if (valInfo.expireAt != null && valInfo.expireAt < now) {
            let _this = this
            setTimeout(function () {
                _this.loadValue(name, args, storageKey)
            }, 0)
        }
        return valInfo.value
    }

    clear(name, args) {
        delete localStorage[this._getStorageKey(name, args)]
    }

    loadValue(name, args, storageKey) {
        let cfg = this.config[name]
        if (cfg == null) {
            throw name + " is not declared in this cache"
        }
        let value
        let loadFail = false
        if (cfg.loader) {
            value = cfg.loader(args)
        } else if (cfg.uriLoader) {
            RequestUtils.request({
                    uri: StringUtils.formatTemplate(cfg.uriLoader, args),
                    async: false
                }, {
                    success(resp) {
                        if (cfg.type === 'json') {
                            try {
                                value = JSON.parse(resp)
                            } catch (e) {
                                loadFail = true
                            }
                        } else {
                            value = resp
                        }
                    }, fail(code, resp) {
                        loadFail = true
                    }
                }
            )
        }
        if (loadFail) {
            return null
        }
        let valueInfo = {value}
        if (cfg.expireAfter > 0) {
            valueInfo.expireAt = new Date().getTime() / 1000 + cfg.expireAfter
        }
        localStorage.setItem(storageKey, JSON.stringify(valueInfo))
        return value
    }

    _getStorageKey(name, args) {
        return this.storagePrefix + name + (args == null ? "" : "_" + JSON.stringify(args))
    }
}

var DB_CACHE = new ObjectCache("db", {
    targets: {
        uriLoader: "/paas/db/targets",
        expireAfter: 60
    },
    tableList: {
        uriLoader: "/paas/db/tables?target=${target}",
        expireAfter: 24 * 60 * 60
    },
    tableBriefList: {},
    tableFullDefinition: {
        uriLoader: "/paas/db/tableFullDefinition?target=${target}&table=${table}",
        expireAfter: 24 * 60 * 60
    }
})


var REDIS_CACHE = new ObjectCache("redis", {
    targets: {
        uriLoader: "/paas/redis/targets",
        expireAfter: 60,
        type: 'json'
    }
})

var NODE_ID_CACHE = new ObjectCache('cmdbNodeId', {
    nodeId: {
        uriLoader: '/paas/cmdb/nodeId?appName=${appName}',
        expireAfter: 7 * 24 * 60 * 60,
        type: 'json'
    }
})

var PIPELINE_CACHE = new ObjectCache('pipeline', {
    pipeline: {
        uriLoader: '/paas/cicd/pipeline/v2/listForApp?appName=${appName}',
        expireAfter: 60 * 60, // 1 hour
        type: 'json'
    }
})


class DataUtils {
    /**
     * @see Uint8Array
     * @return ArrayBuffer
     */
    static decodeHexString(s) {
        if (!s) {
            return new Uint8Array(0).buffer
        }
        if ((s.length % 2) !== 0) {
            throw "Hex string length should be even to be decoded"
        }
        const arr = new Uint8Array(s.length / 2)
        let j = 0
        for (let i = 0; i < arr.length; ++i) {
            const hi = parseInt(s[j], 16)
            if (isNaN(hi)) {
                throw `hex at ${j} = ${s[j]} is not a valid hex`
            }
            const lo = parseInt(s[j + 1], 16)

            if (isNaN(lo)) {
                throw `hex at ${j + 1} = ${s[j + 1]} is not a valid hex`
            }
            arr[i] = (hi << 4) | lo
            j += 2
        }
        return arr.buffer
    }


    /**
     * encode ArrayBuffer to string
     * @param byteArray ArrayBuffer
     * @return {string}
     */
    static encodeToHexString(byteArray) {
        if (byteArray == null) {
            return ""
        }
        const dataView = new DataView(byteArray)
        const arr = new Array(dataView.byteLength * 2)
        let j = 0
        for (let i = 0; i < dataView.byteLength; i++) {
            const k = dataView.getInt8(i)
            arr[j++] = ((k >> 4) & 0xf).toString(16)
            arr[j++] = (k & 0xf).toString(16)
        }
        return arr.join("")
    }


    static quoteToCString(arrayBuffer) {
        const dataView = new DataView(arrayBuffer)
        const arr = new Array(dataView.byteLength * 3)
        let j = 0
        for (let i = 0; i < dataView.byteLength; i++) {
            const k = dataView.getInt8(i)
            arr[j++] = "\\x"
            arr[j++] = ((k >> 4) & 0xf).toString(16)
            arr[j++] = (k & 0xf).toString(16)
        }
        return arr.join("")
    }

    static toInt8ArrayJSON(arrayBuffer) {
        const arr = new Int8Array(arrayBuffer)
        return "[" + arr.join("， ") + "]"
    }

}

class DateUtils  {
	static padding(s) {
		s = String(s)
		if (s.length === 0) {
			return "00"
		} else if (s.length === 1) {
			return "0" + s
		}
		return s
	}
	static formatServerDateStrToYYYYMMDD(dateStr) {
		// new Date(null) = begin
		return DateUtils.jsDateToYYYYMMDD(new Date(dateStr))
	}
	static formatServerDateStrToYYYYMMDD_HHMMSS(dateStr) {
		// new Date(null) = begin
		return DateUtils.jsDateToYYYYMMDD_HHMMSS(new Date(dateStr))
	}
	static jsDateToYYYYMMDD(date) {
		if(date==null){
			date = new Date()
		}
		let p = DateUtils.padding
		// 2020-06-05
		return date.getFullYear() + "-" + p(date.getMonth() + 1) + "-" + p(date.getDate())
	}
	static jsDateToYYYYMMDD_HHMMSS(date) {
		if(date==null){
			date = new Date()
		}
		let p = DateUtils.padding
		// 2020-06-05 06:08:09
		return DateUtils.jsDateToYYYYMMDD(date) + " " +
			p(date.getHours()) + ":" + p(date.getMinutes()) + ":" + p(date.getSeconds())
	}
	static getDateEnd(dateStr) {
		return new Date(dateStr + " 23:59:59")
	}
	static getDateBegin(dateStr) {
		return new Date(dateStr + " 00:00:00")
	}
	static jsDateToSeconds(date) {
		return Number((date.getTime() / 1000).toFixed())
	}
}

class WindowUtils {
	static isWindowContentChanged(){
		return typeof ____WindowContentChanged !== 'undefined' && ____WindowContentChanged==true
	}
	static setWindowContentChanged(changed){
		if(typeof changed==='undefined' || changed){
			window.____WindowContentChanged=true
		}else{
			window.____WindowContentChanged=false
		}
	}
	static installContentMonitor(){
		window.onbeforeunload = function (e) {
			if(WindowUtils.isWindowContentChanged()){
				e.preventDefault()
				// return some other than undefined to indicate modified
				return ""
			}
		}
	}

}

// install for all, but the client is free to set
// there is a diffcult that we call Window.installContentMonitor in window.onload, because window.onload does not gurantee 
// the WindowUtils is loaded(we tested this in chrome)
WindowUtils.installContentMonitor()
