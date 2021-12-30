<template>
    <div>
        <auto-login-frame ref="loginFrame"></auto-login-frame>
        <label>Target:</label>
        <select v-model="target" style="min-width: 50px">
            <option value="">--Select a Target--</option>
            <option v-for="t in targets" :value="t">{{t}}</option>
        </select>
        <br/>
        <div>
            <div style="display: inline;" @click="showTableList = !showTableList">
                <label>Tables<span v-if="showTableList">▼</span><span v-else>▶</span></label>
            </div>
            <!--<div style="display: inline-flex;flex-wrap: wrap" >-->
            <div v-if="showTableList">
                <div style="display: inline-flex;flex-wrap: wrap;">
                    <!-- if comment is prepared-->
                    <div style="display: inline" v-if="tableNameBriefMap && tableNameBriefMap[target]">
                        <span v-for="(comment,table,idx) in tableNameBriefMap[target]" @click="showTable(idx)"
                              :class="{tag:true,chosen:idx===selectedTableIndex}">{{table}} <span
                                :class="{'inherit-background-color': idx === selectedTableIndex,'comment-tag':true}">{{comment}}</span></span>
                    </div>
                    <!-- else if just table names are prepared-->
                    <div style="display: inline" v-else-if="tableNameListMap && tableNameListMap[target]">
                         <span v-for="(table,idx) in tableNameListMap[target]" @click="showTable(idx)"
                               :class="{tag:true,chosen:idx===selectedTableIndex}">{{table}}</span>
                    </div>
                </div>
                <br/>
                <label style="background-color: beige   ">Table Definition:</label> <br/>
                <textarea class="pre" :value="selectedTableDef" style="color:red;width: 800px;height: 200px"></textarea>
            </div>


        </div>
        <!--TODO-->
        <sql-monaco-editor ref="sqlEditor"
                           @require-table="loadTableDetail(target,$event)"
                           :column-map="columnMap"
                           :tables="tableNameListMap?tableNameListMap[target]:[]"></sql-monaco-editor>
        <!--<textarea v-model="sql" placeholder="Sql..." style="min-height: 20em;min-width: 60em;"></textarea>-->

        <div style="display:flex;margin-top: 10px;">
            <button @click="query">Query</button>
            <input type="checkbox" v-model="limit"/> <label>Limit </label>
            <double-click-editable-textarea v-model="queryLimit"></double-click-editable-textarea>
        </div>

        <div style="margin-top: 10px;">
            <button @click="count">Count</button>
        </div>

        <div style="display:flex;margin-top: 10px;">
            <button @click="exportAsExcel">Export as Excel...</button>
            <input v-model="filename" placeholder="filename..."/> <input type="checkbox" v-model="exportLimit"/> <label>Limit </label>
            <double-click-editable-textarea v-model="exportLimitCount"></double-click-editable-textarea>
        </div>
        <hr/>
        <result-area :pure-json="true" :text="errorMsg? errorMsg:data" :error="errorMsg"></result-area>
    </div>


</template>

<script>
    module.exports = {
        name: "DatabaseQuery",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue'),
            'sql-monaco-editor': httpVueLoader('./common/SqlMonacoEditor.vue'),
            'double-click-editable-textarea': httpVueLoader('./DoubleClickEditableTextarea.vue'),
            'auto-login-frame': httpVueLoader('./AutoLoginFrame.vue')
        },
        props: [],
        data() {
            return {
                limit: true,
                queryLimit: 10,
                exportLimit: true,
                exportLimitCount: 10000,
                sql: "",
                data: [],
                targets: [],
                target: "",
                filename: "",
                exportApi: '/paas/db/exportExcel',
                queryAllApi: '/paas/db/queryAll',
                targetsApi: '/paas/db/targets',
                tableApi: '/paas/db/tables',
                tableBriefApi: '/paas/db/tablesBrief',
                tableDefApi: '/paas/db/tableDef',
                tableFullDefinitionApi: '/paas/db/tableFullDefinition',
                selectedTableIndex: -1,
                showTableList: false,
                errorMsg: "",
                tableNameListMap: null, // { target : tableNameList }
                tableNameBriefMap: null, // { target : { table:brief } }
                tableDefinitionsMap: null,// all table for all targets, { <target> : { <table>:  { name:.., comment:.. }} }
                columnMap: null
            }
        },
        computed: {
            // tables() {
            //     if (!this.target) {
            //         return []
            //     }
            //     let tableList
            //     let _this = this
            //     RequestUtils.request({
            //         uri: RequestUtils.makeUrl(_this.tableApi, {target: _this.target}),
            //         async: false
            //     }, function (resp) {
            //         tableList = JSON.parse(resp)
            //     })
            //     return tableList
            // },
            tables() {
                return this.tableBriefMap ? Object.keys(this.tableBriefMap) : []
            },

            tableBriefMap() {
                if (!this.target) {
                    return {}
                }
                let tMap
                let _this = this
                RequestUtils.request({
                    uri: RequestUtils.makeUrl(_this.tableBriefApi, {target: _this.target}),
                    async: false
                }, function (resp) {
                    tMap = JSON.parse(resp)
                })
                return tMap
            },
            selectedTableDef() {
                if (this.selectedTableIndex == null || this.selectedTableIndex < 0 || this.selectedTableIndex >= this.tables.length) {
                    return ""
                } else {
                    return this.getTableDef(this.tables[this.selectedTableIndex])
                }
            },
        },
        watch: {
            target: function (val) {
                this.selectedTableIndex = -1
            }
        },

        methods: {
            // simply cannot use computed property, because some problems or possible bugs
            // do not modify this implementation
            updateColumnMap(tableDefinitionsMap) {
                // console.log('updating columnMap')
                let map = {}
                let tableMap = tableDefinitionsMap ? (tableDefinitionsMap[this.target] || {}) : {}
                let tables = this.tableNameListMap ? (this.tableNameListMap[this.target] || []) : []
                for (let table of tables) {
                    let tableCols = tableMap[table]
                    if (!tableCols) {
                        continue
                    }
                    // console.log('table,tableCols:', table, tableCols)
                    let colMap = {}
                    if (tableCols.columnDefinitions) {
                        for (let definition of tableCols.columnDefinitions) {
                            // console.log('def:', definition)
                            colMap[definition.name] = {label: definition.name + (definition.comment ? " -- " + definition.comment : "")}
                        }
                    }
                    map[table] = colMap
                }
                this.columnMap = map
            },
            loadTableDetail(target, table) {
                if (this.tableDefinitionsMap == null) {
                    this.tableDefinitionsMap = {}
                }
                if (!(target in this.tableDefinitionsMap)) {
                    this.tableDefinitionsMap = Object.assign(this.tableDefinitionsMap, {[target]: {}})
                }
                let tableMap = this.tableDefinitionsMap[target]
                let _this = this
                if (!(table in tableMap)) {
                    RequestUtils.request({
                        uri: RequestUtils.makeUrl(_this.tableFullDefinitionApi, {target, table}),
                        async: true
                    }, {
                        success(resp) {
                            tableMap[table] = JSON.parse(resp)
                            _this.tableDefinitionsMap = Object.assign(_this.tableDefinitionsMap, {[target]: tableMap})
                            // _this.columnMap //update
                            _this.updateColumnMap(_this.tableDefinitionsMap)
                        },
                        fail: _this.handleFail
                    })
                }
            },
            getTableDef(table) {
                let tableDef
                let _this = this
                RequestUtils.request({
                    uri: RequestUtils.makeUrl(_this.tableDefApi, {target: _this.target, table: table}),
                    async: false
                }, {
                    success(resp) {
                        tableDef = resp
                    },
                    fail: _this.handleFail
                })
                return tableDef
            },
            count() {
                this.execute(true)
            },
            query() {
                this.execute(false)
            },
            execute(count) {
                this.sql = this.$refs.sqlEditor.getValue()
                if (!this.checkRequiredFields()) {
                    return
                }
                let reqCount = !!count
                let sqlLimit
                if (!count && this.limit) {
                    sqlLimit = this.queryLimit
                }
                let _this = this
                RequestUtils.request({
                        uri: _this.queryAllApi,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: RequestUtils.toUrlQueryString({
                            target: _this.target,
                            sql: _this.sql,
                            limit: sqlLimit,
                            count: reqCount
                        })
                    }, {
                        success(resp) {
                            _this.data = resp
                        },
                        fail: _this.handleFail
                    }
                )
            },
            exportAsExcel() {
                if (!this.checkRequiredFields()) {
                    return
                }
                if (!this.filename) {
                    this.showError("Requires a filename")
                    return false
                }
                let exportLimit
                if (this.exportLimit) {
                    exportLimit = this.exportLimitCount
                }
                let _this = this
                let query = RequestUtils.toUrlQueryString({
                    target: _this.target,
                    sql: _this.sql,
                    name: _this.filename,
                    limit: exportLimit
                })
                RequestUtils.request({
                    uri: _this.exportApi,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    data: query,
                    binary: true
                }, {
                    success(resp) {
                        let name = _this.filename
                        if (!name.endsWith(".xlsx") && !name.endsWith(".xls")) {
                            name = name + ".xlsx"
                        }
                        FileUtils.chooseFileToSave(resp, name, FileUtils.CONTENT_EXCEL)
                    },
                    fail: _this.handleFail
                })
            },
            showError(msg) {
                this.errorMsg = msg
            },
            handleFail(code, resp) {
                let _this = this
                this.$refs.loginFrame.handleFail(code, resp, function (code, resp) {
                    _this.errorMsg = resp
                })
            },
            checkRequiredFields() {
                this.errorMsg = ""
                if (!this.sql) {
                    this.showError("Requires sql")
                    return false
                }
                if (!this.target) {
                    this.showError("Requires target")
                    return false
                }
                return true
            },
            showTable(idx) {
                this.selectedTableIndex = idx
            },
            loadTableNameListMap() {
                let tableNameListMap = {}
                let _this = this
                // load all tables for all targets
                for (let target of _this.targets) {
                    RequestUtils.request({
                        uri: RequestUtils.makeUrl(_this.tableApi, {target}),
                        async: true
                    }, {
                        success(resp) {
                            // tables
                            tableNameListMap[target] = JSON.parse(resp)
                            _this.tableNameListMap = tableNameListMap
                        },
                        fail: _this.handleFail
                    })
                }
            },
            loadTableNameBriefMap() {
                let tableNameBriefMap = {}
                let _this = this
                for (let target of _this.targets) {
                    RequestUtils.request({
                        uri: RequestUtils.makeUrl(_this.tableBriefApi, {target}),
                        async: true
                    }, {
                        success(resp) {
                            // tables
                            tableNameBriefMap[target] = JSON.parse(resp)
                            _this.tableNameBriefMap = tableNameBriefMap
                        },
                        fail: _this.handleFail
                    })
                }
            }
        },
        mounted() {
            // load targets -> load all tables for all targets ->
            let _this = this
            RequestUtils.request({
                uri: this.targetsApi,
                async: false
            }, {
                success(resp) {
                    _this.targets = JSON.parse(resp)
                    if (_this.targets.length > 0) {
                        _this.target = _this.targets[0]
                    }
                    _this.loadTableNameListMap()
                    _this.loadTableNameBriefMap()
                },
                fail: _this.handleFail
            })
        }
    }
</script>

<style scoped>
    .tag {
        margin-right: 20px;
        padding-right: 10px;
        padding-left: 10px;
        margin-bottom: 2px;
    }

    .tag:hover {
        background-color: antiquewhite
    }

    .tag.chosen {
        background-color: steelblue;
    }

    textarea.pre {
        outline: none;
        border: none;
        resize: none;
        font-family: inherit;
    }

    .comment-tag {
        background-color: blanchedalmond
    }

    .inherit-background-color {
        background-color: inherit;
    }
</style>
