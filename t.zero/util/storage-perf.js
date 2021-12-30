import * as objpath from "@fultonjs/common/src/objpath"

// merge, and try the best to keep the relative order
// there is order for each ID
//  [1,2,3]
//  [4,5,6]
// -> [1,2,3,4,5,6]
//
//  [1,2,3]
//  [2,3,4]
// -> [1,2,3,4]
function mergeArray(base, input, idField = "id") {
    if (!base) {
        return input
    }
    if (!input) {
        return base
    }
    if (!idField) {
        throw new Error("requries idField")
    }
    const m = []
    for (let baseItem of base) {
        const baseID = baseItem[idField]
        let foundInNew = false
        if (baseID) {
            for (let newItem of input) {
                const newID = newItem[idField]
                if (newID === baseID) {
                    foundInNew = true
                    break
                }
            }
        }
        if (!foundInNew) {
            m.push(baseItem)
        }
    }
    return m
}

// the `id` field is respected in v1.1
// the problem here is that: we do not have a 'storage change event', so merge must be first going
// 1.1 split the whole config into different keys, so they do not conflict when used in different place
// and there is a busy flag
export class PerfV1_1 {
    static VERSION = "1.1"
    static upgrade(config) {
        const keys = []
        for (let key of config) {
            if (key) {
                localStorage.setItem(`config.${PerfV1_1.VERSION}.cfg.${key}`, JSON.stringify(config[key]))
                keys.push(key)
            }
        }
        this.updateKeys(keys)
    }

    constructor() {

    }

    get config() {
        const cfg = {}
        for (let key of this.keys) {
            const valStr = localStorage.getItem(`config.${PerfV1_1.VERSION}.cfg.${key}`)
            try {
                cfg[key] = valStr && JSON.parse(valStr)
            } catch (e) {
                console.error("parse config error:key=", key, ",", e)
            }
        }
        return cfg
    }
    get keys() {
        const keysValue = localStorage.getItem(`config.${PerfV1_1.VERSION}.keys`)
        try {
            return keysValue ? JSON.parse(keysValue) : []
        } catch (e) {
            console.error("parse config keys error:", e)
            return []
        }
    }

    updateKeys(keys) {
        localStorage.setItem(`config.${PerfV1_1.VERSION}.keys`, JSON.stringify(keys))
    }

    get(k) {
        if (!k) {
            return undefined
        }
        const valStr = localStorage.getItem(`config.${PerfV1_1.VERSION}.cfg.${k}`)
        try {
            return valStr && JSON.parse(valStr)
        } catch (e) {
            console.error("parse config error:key=", k, ",", e)
        }
    }
    set(k, v) {
        if (!k) {
            throw new Error("cannot set empty key.value to be set:", v)
        }
        localStorage.setItem(`config.${PerfV1_1.VERSION}.cfg.${k}`, JSON.stringify(v))
        const keys = this.keys
        if (!keys.includes(k)) {
            keys.push(k)
            this.updateKeys(keys)
        }
    }
}

function parse(str, defaultObj) {
    if (str) {
        try {
            return JSON.parse(str)
        } catch {
            // ignore
        }

    }
    return defaultObj
}


// Why CRUD ? 
// the perf just not work, why ?
// actaully, CRUD is self-complete, just get & set does not solve that.
// because we want to identify exactly the thing we want to modify, minimazing as less affected  
// fields as possible.

// a config schema is actually a collection of :
// get(table, key)
// set(table, key, value)
// list(table)
// remove(table,key)


export class Perf {
    static VERSION = "1.2"
    constructor(storage, version) {
        this.storage = storage
        this.version = version
    }

    async _getItem(key) {
        return await this.storage.getItem(key)
    }
    async _setItem(key, value) {
        await this.storage.setItem(key, value)
    }
    async _removeItem(key) {
        return await this.storage.removeItem(key)
    }

    async keys(table) {
        return parse(await this._getItem(`config.${PerfV1_2.VERSION}.keys.${table}`)) || []
    }

    async get(table, key) {
        if (!table || !key) {
            return
        }
        return parse(await this._getItem(this._fmtKey(table, key)))
    }

    async set(table, key, value) {
        await this._set(table, key, value, false)
    }
    //
    async setHead(table, key, value) {
        await this._set(table, key, value, true)
    }
    async _set(table, key, value, head) {
        if (!table || !key) {
            throw new Error("invalid table or key")
        }
        // console.log("about to set:", table, key, value,JSON.stringify(value))
        await this._setItem(this._fmtKey(table, key), JSON.stringify(value))
        const keys = await this.keys(table)
        const idx = keys.indexOf(key)
        // head or tail, idx===0 always not need to insert
        if (idx === 0) {
            return
        }
        if (head) {
            if (idx > 0) {
                keys.splice(idx, 1)
            }
            keys.splice(0, 0, key)
        } else if (idx === -1) {
            keys.push(key)
        }
        await this.updateKeys(table, keys)
    }
    async getField(table, key, field) {
        if (!table || !key || !field) {
            return
        }
        return objpath.get(await this.get(table, key), field)
    }
    // set only affect specified field
    async setField(table, key, field, value) {
        if (!table || !key || !field) {
            throw new Error("invalid table,key or field")
        }
        const storageKey = this._fmtKey(table, key)
        const obj = objpath.set(parse(await this._getItem(storageKey)), field, value)
        await this._setItem(storageKey, JSON.stringify(obj))

        const keys = await this.keys(table)
        if (!keys.includes(key)) {
            keys.push(key)
            await this.updateKeys(table, keys)
        }
    }
    async list(table) {
        // this table is actually
        const keys = await this.keys(table)
        const res = []
        for (let key of keys) {
            res.push(await this.get(table, key))
        }
        return res
    }
    async remove(table, key) {
        const keys = await this.keys(table)
        const idx = keys.indexOf(key)
        if (idx >= 0) {
            keys.splice(idx, 1)
            await this.updateKeys(table, keys)
        }
        await this._removeItem(this._fmtKey(table, key))
    }
    async updateKeys(table, keys) {
        if (!table) {
            throw new Error("requires table")
        }
        await this._setItem(`config.${PerfV1_2.VERSION}.keys.${table}`, JSON.stringify(keys || []))
    }

    _fmtKey(table, key) {
        return `config.${PerfV1_2.VERSION}.cfg.${table}.${key}`
    }
}


export class PerfV1_2 extends Perf {
    static VERSION = "1.2"
    constructor() {
        super(localStorage, PerfV1_2.VERSION)
    }
}


export class IDGen {
    constructor(storage, name) {
        this.storage = storage
        this.name = name || "default"
        this.key = `idgen.${this.name}`
    }

    async get() {
        const curStr = await this.storage.getItem(this.key)
        let cur
        try {
            cur = curStr ? parseInt(curStr) : 0
        } catch (e) {
            // ignore
        }
        if (!(cur > 0)) {
            cur = 0
        }
        await this.storage.setItem(this.key, String(cur + 1))
        return cur + 1
    }

}