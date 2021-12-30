class RequestUtils {

    static HEADER_FORM = {
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    static HEADER_JSON = {
        'Content-Type': 'application/json;charset=utf-8'
    }
    static HEADER_TEXT_PLAIN = {
        'Content-Type': 'text/plain'
    }

    // TODO: add content type indication
    // the request is proxied to the server, so that avoid CORS issues
    /**
     * config:
     {
         uri:...,
         method:GET|POST, //default GET
         async: true|false, // default true
         proxyPort:..., // whether to use proxy and the proxyPort,
         headers:...,
         data:...
      }
     callback:  function or struct
     {
         success:...,
         fail:...
      }
     * @param {} config
     * @param {*} callback
     */
    static request(config, callback) {
        if (config.useCurl) {
            RequestUtils.paasCurlRequest(config, callback)
        }
        let requestConfig = RequestUtils.processRequest(config)
        let cb = RequestUtils.getCallback(callback)
        if (!requestConfig.async && requestConfig.binary) {
            cb.fail(0, "Cannot set async=false and binary=true")
            return
        }
        let xmlRequest = new XMLHttpRequest()

        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState === 4 /*completed*/) {
                if (xmlRequest.status === 200) {
                    if (cb.success) {
                        if (requestConfig.binary) {
                            cb.success(xmlRequest.response)
                        } else {
                            cb.success(xmlRequest.responseText)
                        }
                    }
                } else {
                    if (cb.fail) {
                        cb.fail(xmlRequest.status, xmlRequest.responseText)
                    }
                }
            }
        }
        xmlRequest.open(requestConfig.method, requestConfig.uri, requestConfig.async)

        if (config.binary) {
            xmlRequest.responseType = "arraybuffer";
        }
        if (requestConfig.headers) {
            for (let header of requestConfig.headers) {
                xmlRequest.setRequestHeader(header.name, header.value)
            }
        }


        if (requestConfig.data) {
            xmlRequest.send(requestConfig.data);
        } else {
            xmlRequest.send();
        }
    }

    /**
     * does not support binary
     * @param config
     * @param callback
     */
    static paasCurlRequest(config, callback) {
        if (config.binary) {
            throw "PAAS/Curl does not support binary"
        }
        if (config.proxyPort != null) {
            throw "PAAS/Curl must not use proxy"
        }
        if (!config.serverIp) {
            throw "PAAS/Curl requires a server ip as backend proxy"
        }
        let requestConfig = RequestUtils.processRequest(config)
        let cb = RequestUtils.getCallback(callback)

        let xmlRequest = new XMLHttpRequest()
        xmlRequest.onreadystatechange = function () {
            if (xmlRequest.readyState === 4 /*completed*/) {
                if (xmlRequest.status === 200) {
                    let respObj = JSON.parse(xmlRequest.responseText)
                    if (respObj.code !== 0 || respObj.data == null || respObj.data.length === 0) {
                        if (cb.fail) {
                            cb.fail(respObj.code, xmlRequest.responseText)
                        }
                    } else if (cb.success) {
                        cb.success(respObj.data[0])
                    }
                } else {
                    if (cb.fail) {
                        cb.fail(xmlRequest.status, xmlRequest.responseText)
                    }
                }
            }
        }
        xmlRequest.open("POST", "http://cicd.?.xyz/pipelines/cd/tool/0/cmd", requestConfig.async)
        xmlRequest.setRequestHeader("Content-Type", "application/json;charset=utf-8")

        let headersKey = []
        let headersValue = []

        if (requestConfig.headers) {
            for (let header of requestConfig.headers) {
                headersKey.push(header.name)
                headersValue.push(header.value)
            }
        }
        // '{"curlMode":"POST","ipList":["10.30.74.109"],"tgtUrl":"localhost:8080/check.do","appName":"ads-intf","headersKey":["A"],"headersValue":["B"],"raw":"dsfds"}'
        // http://a.b.c:8080/d
        // hostname = a.b.c
        // host = a.b.c:8080
        let url = new URL(config.uri)
        let requestModel = {
            "curlMode": requestConfig.method,
            "ipList": [config.serverIp],
            "tgtUrl": url.host + url.pathname,
            "appName": "ads-test",
            "headersKey": headersKey,
            "headersValue": headersValue,
            "raw": requestConfig.data
        }
        xmlRequest.send(JSON.stringify(requestModel))
    }

    static getCallback(callback) {
        let onSuccess = null
        let onFailed = null
        if (callback) {
            if (callback.constructor === Function) {
                onSuccess = callback
            } else {
                /* being type of Object */
                onSuccess = callback.success
                onFailed = callback.fail
            }
        }
        if (!onFailed) {
            onFailed = function (statusCode, msg) {
                throw JSON.stringify({
                    statusCode,
                    msg
                })
            }
        }
        return {success: onSuccess, fail: onFailed}
    }

    static toCurlRequest(config) {
        let requestConfig = RequestUtils.processRequest(config)
        let explicityMethod = ""
        if (requestConfig.data != null && requestConfig.method === 'GET') {
            explicityMethod = "-X GET"
        }
        let headersOption = ""
        if (requestConfig.headers) {
            let headerGroup = []
            for (let h of requestConfig.headers) {
                let value = h.value || ""
                let header = h.name || ""
                headerGroup.push(`-H ${RequestUtils.quoteBash(header + ": " + value)}`)
            }
            headersOption = headerGroup.join(" ")
        }
        let dataOption = ""
        let dataPrefix = ""
        if (requestConfig.data != null) {
            if (requestConfig.data.constructor === ArrayBuffer) {
                dataOption = "--data-binary \"$(echo -ne '" + RequestUtils.quoteBash(requestConfig.data) + "')\""
            } else {
                dataOption = `--data-binary ${RequestUtils.quoteBash(requestConfig.data)}`
            }
        }
        return `curl ${explicityMethod} ${RequestUtils.quoteBash(requestConfig.uri)} ${headersOption} ${dataOption}`
    }

    static quoteBash(s) {
        if (!s) {
            return "''"
        } else if (s.constructor === ArrayBuffer) {
            const dataView = new DataView(s)
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
        else if (s.constructor === String) {
            return "'" + s.replace("'", "'\\''") + "'"
        } else {
            throw "Unknown type of data to quote to bash:" + s.constructor
        }
    }

    /**
     * default async = true
     * @param config {{method:string, uri:string,useCurl:boolean, binary:boolean, data:*,headers:list|map, async:boolean, proxyPort:int}}
     * @returns {{method: string, uri: *, headers: *, data: *, binary: boolean, async:}}
     */
    static processRequest(config) {
        // check and set defaults
        if (!config) {
            throw "Requires config"
        }

        let method = config.method
        if (!config.method) {
            if (config.data) {
                method = "POST"
            } else {
                method = "GET"
            }
        }
        method = method.toUpperCase()
        let useProxy = config.proxyPort != null
        if (useProxy) {
            if (!config.uri || !config.uri.startsWith("http://")) {
                throw "Proxy only supports uri starts with http://, given uri = " + config.uri
            }
        }
        let useCurl = !!config.useCurl

        let uri
        // let contentType = null
        if (useProxy) {
            let url = new URL(config.uri)
            // headers as path
            let urlParams = new URLSearchParams()
            if (config.headers) {
                if (config.headers.constructor === Array) {
                    for (let header of config.headers) {
                        // if(header.name == "Content-Type"){
                        //     contentType = header.value
                        // }
                        urlParams.append(header.name, header.value)
                    }
                } else {
                    for (let name in config.headers) {
                        // if(name == "Content-Type"){
                        //     contentType = config.headers[name]
                        // }
                        urlParams.append(name, config.headers[name])
                    }
                }
            }
            let urlParamString = urlParams.toString()
            // TODO configure remote proxy port
            let targetHost = url.host
            url.host = location.hostname + ":" + config.proxyPort
            url.pathname = '/' + targetHost + (urlParamString ? "_" + urlParamString : "") + url.pathname
            uri = url.toString()
        } else if (!useCurl) {
            uri = config.uri
            if (uri == null) {
                uri = ""
            }
            if (!uri.startsWith("http://") && !uri.startsWith("https://")) {
                uri = location.protocol + "//" + location.host + (uri.startsWith("/") ? uri : (location.pathname + "/" + uri))
            }
        } else {
            // useCurl
            if (config.uri == null || !config.uri.startsWith("http://")) {
                throw "PAAS/Curl only supports http:// visit"
            }
        }
        let headers

        // non-proxy headers
        if (!useProxy) {
            if (config.headers) {
                if (config.headers.constructor === Array) {
                    headers = config.headers
                } else {
                    headers = []
                    for (let name in config.headers) {
                        headers.push({
                            name,
                            value: config.headers[name]
                        })
                    }
                }
            }
        }
        return {
            method,
            uri,
            headers,
            data: config.data,
            binary: !!config.binary,
            useCurl,
            async: config.async == null || config.async,
        }

    }

    static toUrlQueryString(param) {
        if (!param) {
            return ""
        }
        let urlParams = new URLSearchParams()
        if (param.constructor === Array) {
            for (let p of param) {
                if (p != null) {
                    urlParams.append(p.name, p.value)
                }
            }
        } else {
            for (let name in param) {
                let val = param[name]
                if (val) {
                    urlParams.append(name, val)
                }
            }
        }
        return urlParams.toString()
    }

    static makeUrl(api, param) {
        let urlParamString = RequestUtils.toUrlQueryString(param)
        if (!urlParamString) {
            return api
        }
        if (api == null) {
            api = ""
        }
        let connector =
            api.indexOf("?") === -1
                ? "?"
                : api.endsWith("&") || api.endsWith("?")
                ? ""
                : "&"
        return api + connector + urlParamString
    }
}
