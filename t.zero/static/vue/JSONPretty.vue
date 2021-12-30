<template>
    <div>
        <label>JSON Text:</label>
        <button @click="load">Load...</button>
        <br/>
        <textarea style="width: 100%;height: 200px" v-model="text"></textarea> <br/>
        <button @click="saveJson">Save JSON</button>
        <button @click="saveExcel">Save Excel</button>
        <br/>
        <result-area :text="this.text" :pure-json="true" ref="result" :input-may-not-be-js-expr="true"></result-area>
    </div>
</template>

<script>
    module.exports = {
        name: "JSONPretty",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue'),
        },
        props: [],
        data() {
            return {
                text: ""
            }
        },

        methods: {
            load() {
                let _this = this
                FileUtils.chooseFileToRead(function (result, filename) {
                    let text
                    if (filename.name.endsWith(".json")) {
                        text = result.constructor === String ? result : StringUtils.decodeArrayToString(result)
                    } else {
                        text = JSON.stringify(ExcelUtils.loadExcel(result), null, "    ")
                    }
                    _this.text = text
                }, {binary: true, accept: '.json,.xls,.xlsx'})
            },
            saveJson() {
                FileUtils.chooseFileToSave(this.result, "file.json", FileUtils.CONTENT_JSON)
            },
            saveExcel() {
                ExcelUtils.toExcel(JSON.parse(this.result), "file.xlsx")
            }
        },

        computed: {
            result() {
                return this.$refs.result.getCurrentText()
            }
        },
        watch: {
	    text(){
	        WindowUtils.setWindowContentChanged() 
	    }
	},

        created: function () {
        },
    }
</script>

<style scoped>

</style>
