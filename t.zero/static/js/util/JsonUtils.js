// Types: Number, String

class InvalidType {
    static instance = new InvalidType()

    toString() {
        return "InvalidType"
    }
}

class NumberType {
    static instance = new NumberType()

    toString() {
        return "NumberType"
    }
}

class StringType {

    static instance = new NumberType()

    toString() {
        return "StringType"
    }
}

class UnderminedType {
    static instance = new StringType()

    toString() {
        return "UnderminedType"
    }
}

class DateType {
    static instance = new DateType()

    toString() {
        return "DateType"
    }
}

class DatetimeType {
    static instance = new DatetimeType()

    toString() {
        return "DatetimeType"
    }
}

class ArrayType {
    constructor(elementType) {
        this.elementType = elementType
    }

    toString() {
        return "ArrayType<" + this.elementType + ">"
    }
}

// MapType only allow string as key type
class MapType {
    constructor(valueType) {
        this.valueType = valueType
    }

    toString() {
        return "MapType<StringType," + this.valueType + ">"
    }
}

class ObjectType {
    constructor(typeMap) {
        this.typeMap = typeMap
    }

    toString() {
        let typeInfo = []
        if (this.typeMap) {
            for (let k in this.typeMap) {
                typeInfo.push(k + ":" + this.typeMap[k].toString())
            }
        }
        return "{" + (typeInfo.join(", ")) + "}"
    }
}

class JsonUtils {

    static DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/
    static DATE_TIME_REGEX = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
    static NUMBERIC = /^\d+(?:\.\d+)?$/

    /**
     * if array is empty, then null is returned to indicate nothing
     * @param a
     */
    static inferArrayElementType(a) {
        if (a == null || a.constructor !== Array) {
            throw "Requires array type"
        }
        if (a.length === 0) {
            return UnderminedType.instance
        }
        let currentType = UnderminedType.instance
        for (let e of a) {
            currentType = JsonUtils.inferSameCollectionType(e, currentType)
            if (currentType === InvalidType.instance) {
                return InvalidType.instance
            }
        }
        return currentType
    }

    static inferMapElementType(a) {
        if (a == null || a.constructor !== Object) {
            throw "Requires object type"
        }
        let currentType = UnderminedType.instance
        for (let e in a) {
            let subType = JsonUtils.inferType(a[e])
            currentType = JsonUtils.mergeType(currentType, subType)
            if (currentType === InvalidType.instance) {
                return InvalidType.instance
            }
        }
        return currentType
    }

    static inferSameCollectionType(e, lastType) {
        let subType = JsonUtils.inferType(e)
        if (subType === InvalidType.instance) {
            return InvalidType.instance
        }
        if (subType === UnderminedType.instance) {
            return lastType
        }
        if (lastType === UnderminedType.instance) {
            return subType
        } else if (lastType !== subType) {
            // being ObjectType, will be merged
            if (lastType.constructor === ObjectType && subType.constructor === ObjectType) {

            }
            // e must not null here
            if (e.constructor === String) {
                // String can be anything
                return StringType.instance
            } else if (subType.constructor === ObjectType) {

            }
            if (e != null && e.constructor === String) {
                return StringType.instance
            } else {
                return InvalidType.instance
            }
        }
        return subType
    }

    static mergeType(tp1, tp2) {
        if (tp1 === tp2) {
            return tp1
        }
        if (tp1 === InvalidType.instance || tp2 === InvalidType.instance) {
            return InvalidType.instance
        }
        if (tp1.constructor !== tp2.constructor) {
            if (tp1.constructor === StringType || tp2.constructor === StringType) {
                return StringType.instance
            }
            return InvalidType.instance
        }
        if (tp1.constructor === ArrayType) {
            let subType = JsonUtils.mergeType(tp1.elementType, tp2.elementType)
            if (subType === InvalidType.instance) {
                return InvalidType.instance
            }
            return new ArrayType(subType)
        } else if (tp1.constructor === ObjectType) {
            let map = {}
            let keySet = new Set(Object.keys(tp1.typeMap))
            for (let k in tp2.typeMap) {
                keySet.add(k)
            }
            for (let k of keySet) {
                let stp1 = tp1.typeMap[k]
                let stp2 = tp2.typeMap[k]
                let subType = null
                if (stp1 == null) {
                    subType = stp2
                } else if (stp2 == null) {
                    subType = stp1
                } else {
                    subType = JsonUtils.mergeType(stp1, stp2)
                }
                if (subType == null || subType === InvalidType.instance) {
                    return InvalidType.instance
                }
                map[k] = subType
            }
            return new ObjectType(map)
        } else {
            // cannot merge
            return InvalidType.instance
        }
    }

    // infer single
    static inferType(e) {
        if (e == null) {
            return UnderminedType.instance
        }
        if (e.constructor === Array) {
            // if array of object, infer each key type
            let subType = JsonUtils.inferArrayElementType(e)
            if (subType === InvalidType.instance) {
                return InvalidType.instance
            }
            return new ArrayType(subType)
        } else if (e.constructor === Number) {
            return NumberType.instance
        } else if (e.constructor === String) {
            // String never be undermined
            if (e.length === 0) {
                return StringType.instance
            } else if (JsonUtils.DATE_TIME_REGEX.test(e)) {
                return DatetimeType.instance
            } else if (JsonUtils.DATE_REGEX.test(e)) {
                return DateType.instance
            } else if (JsonUtils.NUMBERIC.test(e)) {
                return NumberType.instance
            }
            return StringType.instance
        } else if (e.constructor === Object) {
            let map = {}
            for (let k in e) {
                let tp = JsonUtils.inferType(e[k])
                if (tp === InvalidType.instance) {
                    return InvalidType.instance
                }
            }
            return new ObjectType(map)
        } else {
            return InvalidType.instance
        }
    }

    /**
     * if given parameter is a String, try to return its represented json object
     * otherwise return the parameter itself unchanged
     * @param text
     * @return {*}
     */
    static getPossibleJSONObject(text,inputMayNotBeJsExpr) {
        if (text == null) {
            return null
        }
        if (text.constructor === String) {
            let trimed = text.trimStart()
            if (trimed.startsWith("[") || trimed.startsWith("{") || trimed.startsWith("\"")) {
                try {
			if(inputMayNotBeJsExpr){
				return JSON.parse(text)
			}else{
				return JsonUtils.evaluateObject(text)
			}
                } catch (e) {
                    // ignore
                }
            }
        }
        return text
    }

    // options: compress=whether compress the data
    static formatPossibleJSON(text, option) {
        let obj = JsonUtils.getPossibleJSONObject(text)
        if (obj == null) {
            return null
        }
        if (obj.constructor === String) {
            return obj
        } else if (obj.constructor === Set) {
            obj = [...obj]
        }
        if (option && option.compress) {
            return JSON.stringify(obj)
        }
        return JSON.stringify(obj, null, "    ")
    }

    /**
     * get json path, the last part uses a prefix match
     * @param json
     * @param pathArray
     * @returns {*}
     */
    static getJsonPath(json, pathArray) {
        let current = json
        let n = pathArray.length
        for (let i = 0; i < n - 1; ++i) {
            current = JsonUtils.getIndexPath(current, pathArray[i])
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
                    return JsonUtils.getIndexPath(current, lastPart)
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

    static getIndexPath(json, path) {
        if (json == null) {
            return null
        }
        if (path.startsWith("[")) {
            if (!path.endsWith("]")) {
                throw `path:${path} is invalid`
            }
            let inner = path.substring(1, path.length - 1)
            inner = StringUtils.unquoteString(inner)
            if (!inner) {
                throw `path:${path} is invalid`
            }
            if (json.constructor === Array) {
                let n = StringUtils.possibleNumberOf(inner)
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
    static evaluateObject(s) {
        return eval('(' + s + ')')
    }

    static executeOnJson(json, f) {
        f.bind(json)()
    }
}
