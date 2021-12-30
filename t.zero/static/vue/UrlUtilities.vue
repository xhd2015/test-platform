<template>
    <div>
        <div style="display: flex">
            <label style="align-self: center">Object:</label>
            <textarea @input="DocumentUtils.updateTextareaHeight($event.target)" v-model="text"
                      placeholder="http://... or the parameter" style="width: 100%;overflow: hidden"></textarea>
        </div>
        <div style="display: flex;margin-top: 10px">
            <button style="margin-right: 20px" @click="decode">Decode</button>
            <button style="margin-right: 20px" @click="encode">Encode</button>
            <button style="margin-right: 20px" @click="encodeJSON">Encode JSON to URL Param</button>
        </div>

        <hr/>
        <div>
            <div v-if="result">{{result}}</div>
            <div v-else-if="urlResult">
                <p v-for="param of urlResult">
                    {{param.key}}: {{param.value}}
                </p>
            </div>
        </div>
    </div>


</template>

<script>
    module.exports = {
        name: "UrlUtilities",
        components: {},
        props: [],
        data() {
            return {
                text: "",
                protocolRegex: new RegExp("^(\\w+)://.*$"),
                result: "",
                urlResult: [],
                jsonPrompt: "You can provide a json object,within which uri is treated as uri, and other key values are added to parameter.The json object can optionally represented as a javascript object"
            }
        },

        methods: {
            decode() {
                this.clearResult()
                if (!this.text) {
                    return
                }
                let match = this.protocolRegex.exec(this.text)
                if (match == null) {
                    this.result = decodeURIComponent(this.text)
                } else {
                    let url
                    try {
                        url = new URL(this.text)
                    } catch (e) {
                        this.result = "Invalid url"
                        return
                    }
                    let params = new URLSearchParams(url.search)
                    this.urlResult = []
                    for (let k of params.entries()) {
                        this.urlResult.push({
                            key: k[0],
                            value: k[1]
                        })
                    }
                }
            },
            encode() {
                this.clearResult()
                this.result = encodeURIComponent(this.text)
            },
            encodeJSON() {
                this.clearResult()
                if (!this.text) {
                    this.result = this.jsonPrompt
                    return
                }
                let obj
                try {
                    obj = JSON.parse(this.text)
                } catch (e) {
                    try {
                        obj = eval("(" + this.text + ")")
                    } catch (e2) {
                        this.result = "Parse json error:" + e.toString()
                        return
                    }
                }
                if (obj.constructor !== Object) {
                    this.result = this.jsonPrompt
                    return
                }
                let uri = obj.uri
                delete obj.uri
                this.result = RequestUtils.makeUrl(uri, obj)
            },
            clearResult() {
                this.result = ""
                this.urlResult = []
            }
        }
    }
</script>

<style scoped>
</style>
