
import * as jsonUtils from "@fultonjs/common/src/json"
import { unquoteString, possibleNumberOf } from "./strings"

export function parse(json, ...options) {
    return jsonUtils.parseJSONSafeBigint(json, ...options)
}
export function stringify(object, ...options) {
    return jsonUtils.stringifyJSONSafeBigint(object, ...options)
}

/**
 * if given parameter is a String, try to return its represented json object
 * otherwise return the parameter itself unchanged
 * @param text
 * @return {*}
 */
export function getPossibleJSONObject(text, inputMayNotBeJsExpr) {
    if (text == null) {
        return null
    }
    if (text.constructor === String) {
        let trimed = text.trimStart()
        if (trimed.startsWith("[") || trimed.startsWith("{") || trimed.startsWith("\"")) {
            try {
                if (inputMayNotBeJsExpr) {
                    return parse(text)
                } else {
                    return evaluateObject(text)
                }
            } catch (e) {
                // ignore
            }
        }
    }
    return text
}
// options: compress=whether compress the data
//          keys:boolean,  return keys of that object
export function formatPossibleJSON(text, option) {
    let obj = getPossibleJSONObject(text)
    if (obj == null) {
        return null
    }
    if (obj.constructor === String) {
        return obj
    } else if (obj.constructor === Set) {
        obj = [...obj]
    }
    if (option?.keys && typeof obj === 'object' && !Array.isArray(obj)) {
        obj = Object.keys(obj)
    }
    if (option && option.compress) {
        return stringify(obj)
    }
    return stringify(obj, null, "    ")
}

/**
 * get json path, the last part uses a prefix match
 * @param json
 * @param pathArray
 * @returns {*}
 */
export function getJsonPath(json, pathArray) {
    let current = json
    let n = pathArray.length
    for (let i = 0; i < n - 1; ++i) {
        current = getIndexPath(current, pathArray[i])
        if (current == null) {
            return current
        }
    }
    if (n > 0) {
        if (current == null) {
            return current
        }
        let lastPart = pathArray[n - 1]
        if (lastPart) {
            if (current.constructor !== Object) {
                return getIndexPath(current, lastPart)
            } else {
                let filtered = {}
                for (let k in current) {
                    if (k.startsWith(lastPart)) {
                        filtered[k] = current[k]
                    }
                }
                return filtered
            }
        }
    }
    return current
}

export function getIndexPath(json, path) {
    if (json == null) {
        return null
    }
    if (path.startsWith("[")) {
        if (!path.endsWith("]")) {
            throw `path:${path} is invalid`
        }
        let inner = path.substring(1, path.length - 1)
        inner = unquoteString(inner)
        if (!inner) {
            throw `path:${path} is invalid`
        }
        if (json.constructor === Array) {
            let n = possibleNumberOf(inner)
            if (n != null && n.constructor === Number) {
                return json[n]
            }
            return null
        } else {
            return json[inner]
        }
    } else {
        return json[path]
    }
}


// allow any javascript expression,including json whose key is numeric
export function evaluateObject(s) {
    return eval('(' + s + ')')
}

export function executeOnJson(json, f) {
    f.bind(json)()
}