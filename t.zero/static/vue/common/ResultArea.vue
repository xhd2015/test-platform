<!--A ResultArea renders json results in a pretty printed mode-->
<template>
    <div>
        <div v-if="showJsonOptions">
            <select v-model="filterMode">
                <option value="jsEval">JSON Evaluation</option>
                <option value="jsonPath">JSON Path</option>
            </select>
            <span>:</span>
            <div style="display: inline">
                <input v-if="filterMode==='jsonPath'" style="width:300px" placeholder="key.data[0].value"
                       v-model="keyPath"/>
                <input v-else-if="filterMode==='jsEval'" style="width: 300px" placeholder="this.key"
                       v-model="evaluationScript"/>
            </div>
            <!--<input type="checkbox" /><label>Unwrap String as JSON</label>-->
            <input type="checkbox" v-model="compress"/><label>Compress</label>
            <br/>
        </div>
        <textarea ref="resultArea" :class='{"message-box":true, "error":hasError}' disabled="true"></textarea>
    </div>
</template>

<script>
    module.exports = {
        name: "ResultArea",
        components: {},
	// inputMayNotBeJsExpr:  the input may not be a javascript expression
	// default:false
	// why this option?  allow integer as key
	// but it has a drawback: big numbers not be precisely represented because js uses float to store number 
        props: ["error", "text", "possibleJson", "hideJsonFilter", "pureJson","inputMayNotBeJsExpr"],
        data() {
            return {
                keyPath: "",
                cachedText: "",
                internalError: "",
                evaluationScript: "",
                filterMode: "jsEval",
                compress: false,
            }
        },

        methods: {
            updateArea() {
                this.internalError = ""
                let area = this.$refs.resultArea
                let text = this.filteredText
                area.value = this.internalError ? this.internalError : text
                this.cachedText = this.filteredText
                DocumentUtils.updateTextareaHeight(area)
            },
            getText() {
                return this.text
            },
            /**
             * if error exists, not data is returned
             * @return {*}
             */
            getCurrentText() {
                return this.hasError ? null : this.filteredText
            }
        },
        computed: {
            hasError() {
                return this.error || this.internalError
            },
            maybeJson() {
                return this.pureJson || this.possibleJson
            },
            showJsonOptions() {
                return this.maybeJson && !this.hideJsonFilter
            },
            filteredText() {
                if (this.error) {
                    return this.text
                }
                if (!this.maybeJson) {
                    return this.text
                }
                let obj
                if (this.pureJson) {
                    if (!this.text) {
                        return ""
                    }
                    try {
			    if(this.inputMayNotBeJsExpr){
				    obj = JSON.parse(this.text)
			    }else{
				    obj = JsonUtils.evaluateObject(this.text)
			    }
                    } catch (e) {
                        this.internalError = e.toString()
                        return this.cachedText
                    }
                } else {
                    obj = JsonUtils.getPossibleJSONObject(this.text, this.inputMayNotBeJsExpr)
                    if (obj == null) {
                        return this.text
                    }
                }
                // // JSON String is parsed for twice
                // if (obj.constructor === String && obj.startsWith("\"")) {
                //     let tmpObj = JsonUtils.getPossibleJSONObject(obj)
                //     if (tmpObj == null) {
                //         return obj
                //     }
                //     obj = tmpObj
                // }
                // if (obj != null && obj.constructor === String) {
                //     return obj
                // }
                // if (!obj) {
                // cur = obj
                // } else {
                let cur = obj
                if (this.filterMode === 'jsonPath') {
                    let arr = this.keyPath.split(/\.|(?=\[)/)
                    if (arr.length === 1 && arr[0] === "") {
                        arr = []
                    }
                    try {
                        cur = JsonUtils.getJsonPath(obj, arr)
                    } catch (e) {
                        if (this.possibleJson) {
                            return this.cachedText
                        } else {
                            this.internalError = e.toString()
                            return this.cachedText
                        }
                    }
                } else if (this.filterMode === 'jsEval') {
                    if (this.evaluationScript) {
                        let f
                        try {
                            //
                            f = eval("(function(){with(ObjectUtils.enhanceObject(this)){ { return (" + this.evaluationScript + ");}}})")
                        } catch (e) {
                            this.internalError = "Evaluation script compile error:" + e.toString()
                            return this.cachedText
                        }
                        try {
                            cur = f.bind(obj)(obj)
                        } catch (e) {
                            this.internalError = "Evaluation script execution error:" + e.toString()
                            return this.cachedText
                        }
                    }
                }
                let compress = this.compress
                return JsonUtils.formatPossibleJSON(cur, {compress})
            }
        },
        watch: {
            text() {
                this.debouncedUpdateArea()
            },
            keyPath() {
                this.debouncedUpdateArea()
            },
            maybeJson() {
                this.debouncedUpdateArea()
            },
            evaluationScript() {
                this.debouncedUpdateArea()
            },
            filterMode() {
                this.debouncedUpdateArea()
            },
            compress() {
                this.debouncedUpdateArea()
            }
        },

        created: function () {
            this.debouncedUpdateArea = _.debounce(this.updateArea, 200)
            // this.debouncedUpdateUsingEvaluation = _.debounce(this.updateUsingEvaluation, 400)
            // console.log("created")
        },
        updated() {
            // console.log("updated")
        },
        mounted() {
        }
    }
</script>

<style scoped>
    textarea.message-box {
        display: block;
        height: auto;
        overflow: auto;
        margin: 0;
        font-family: Courier New, sans-serif;
        border: none;
        box-shadow: none;
        background-color: #f0f0f0;
        width: 100%;
        padding: 6px 12px;
        border-radius: 4px;
    }

    textarea.message-box.error {
        color: #900;
        background-color: #fee;
    }
</style>
