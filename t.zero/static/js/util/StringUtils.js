console.log('loading StringUtils')

class StringUtils {
    static capitalize(s) {
        if (!s) {
            return s
        }
        if (s.length === 1) {
            return s.toUpperCase()
        }
        return s[0].toUpperCase() + s.substring(1)
    }

    static decapitalize(s) {
        if (!s) {
            return s
        }
        if (s.length === 1) {
            return s.toLowerCase()
        }
        return s[0].toLowerCase() + s.substring(1)
    }

    static possibleNumberOf(s) {
        let n = Number(s)
        return isNaN(n) ? s : n
    }

    static splitString(s) {
        if (!s) {
            return []
        }
        let arr = s.split(',')
        if (arr.length === 1 && !arr[0]) {
            return []
        }
        return arr
    }

    static splitNumber(s) {
        if (!s) {
            return []
        }
        let arr = s.split(',')
        return arr.filter(e => e).map(e => Number(e.trim())).filter(e => !isNaN(e))
    }

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


    static unquoteString(s) {
        if (s == null) {
            return null
        }
        let quote = null;
        s = s.trim()
        if (s.startsWith("'")) {
            quote = "'"
        } else if (s.startsWith("\"")) {
            quote = "\""
        }
        if (!quote) {
            return s
        }
        if (!s.endsWith(quote)) {
            throw `Unclosed string:${quote}`
        }
        s = s.substring(1, s.length - 1)
        let arr = []
        for (let i = 0; i < s.length; ++i) {
            if (s[i] === "\\") {
                if (i === s.length - 1) {
                    throw "Not complete escape:\\"
                }
                if (s[i + 1] === "n") {
                    arr.push("\n")
                } else if (s[i + 1] === "t") {
                    arr.push("\t")
                } else {
                    arr.push(s[i + 1])
                }
                ++i
            } else {
                arr.push(s[i])
            }
        }
        return arr.join("")
    }

    static decodeArrayToString(arrayBuffer) {
        // Decode as UTF-8
        var decoder = new TextDecoder('utf8');
        return decoder.decode(arrayBuffer)
    }

    static formatTemplate(template, config) {
        if (config == null) {
            return template
        }
        for (let k in config) {
            template = template.replace(new RegExp("\\$\\{" + k + "\\}", "g"), config[k])
        }
        return template
    }
}

