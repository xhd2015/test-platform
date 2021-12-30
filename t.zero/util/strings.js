

export function isEmpty(t) {
    return t == null || t === ''
}

export function unquoteString(s) {
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
export function possibleNumberOf(s) {
    let n = Number(s)
    return isNaN(n) ? s : n
}
export function decodeArrayToString(arrayBuffer) {
    // Decode as UTF-8
    var decoder = new TextDecoder('utf8');
    return decoder.decode(arrayBuffer)
}
export function formatTemplate(template, config) {
    if (config == null) {
        return template
    }
    for (let k in config) {
        template = template.replace(new RegExp("\\$\\{" + k + "\\}", "g"), config[k])
    }
    return template
}
export function capitalize(s) {
    if (!s) {
        return s
    }
    if (s.length === 1) {
        return s.toUpperCase()
    }
    return s[0].toUpperCase() + s.substring(1)
}

export function decapitalize(s) {
    if (!s) {
        return s
    }
    if (s.length === 1) {
        return s.toLowerCase()
    }
    return s[0].toLowerCase() + s.substring(1)
}

/**
   * @see Uint8Array
   * @return ArrayBuffer
   */
export function decodeHexString(s) {
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
export function encodeToHexString(byteArray) {
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


export function quoteToCString(arrayBuffer) {
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

export function toInt8ArrayJSON(arrayBuffer) {
    const arr = new Int8Array(arrayBuffer)
    return "[" + arr.join("， ") + "]"
}
