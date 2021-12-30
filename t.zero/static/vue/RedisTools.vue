<template>
    <div>
        <auto-login-frame ref="loginFrame"></auto-login-frame>
        <label>Cluster:</label>
        <select v-model="target" style="min-width: 50px">
            <option value="">--Select a Cluster--</option>
            <option v-for="t in targets" :value="t">{{t}}</option>
        </select>
        <br/>
        <div>
            <div style="display: inline;" @click="showTableList = !showTableList">
                <label>Famous Keys<span v-if="showTableList">▼</span><span v-else>▶</span></label>
            </div>
            <!--<div style="display: inline-flex;flex-wrap: wrap" >-->
            <div v-if="showTableList">
                <div style="display: inline-flex;flex-wrap: wrap;">
                    <!-- if comment is prepared-->
                    <div style="display: inline" v-if="currentKeyMap">
                        <span v-for="(detail,key) in currentKeyMap" @click="showDetail(key)"
                              :class="{tag:true,chosen:key===selectedKey}">{{key}} <span
                                :class="{'inherit-background-color': key === selectedKey,'comment-tag':true}">{{detail.description}}</span></span>
                    </div>
                </div>
                <br/>
                <adaptive-text-area :value="selectedKeyDef" style="color: red;width: 500px;"></adaptive-text-area>
            </div>
        </div>
        <input style="width: 300px" v-model="command" placeholder="get ..."/>

        <div style="margin-top: 10px;">
            <button @click="execute">Execute</button>
        </div>
        <hr/>
        <result-area :possible-json="true" :text="errorMsg? errorMsg:data" :error="errorMsg"></result-area>
    </div>


</template>

<script>
    module.exports = {
        name: "RedisTools",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue'),
            'auto-login-frame': httpVueLoader('./AutoLoginFrame.vue'),
            'adaptive-text-area': httpVueLoader('./common/AdaptiveTextArea.vue')
        },
        props: [],
        data() {
            return {
                limit: true,
                command: "",
                data: [],
                targets: [],
                target: "",
                queryAllApi: '/paas/redis/execute',
                targetsApi: '/paas/redis/clusters',
                keysApi: '/paas/redis/knownKeysTemplate',
                selectedKey: null,
                showTableList: false,
                keyTemplateMap: null,
                errorMsg: ""
            }
        },
        computed: {
            currentKeyMap() {
                let _this = this
                if (this.keyTemplateMap == null || this.keyTemplateMap[this.target] == null) {
                    RequestUtils.request({
                        uri: RequestUtils.makeUrl(this.keysApi, {cluster: this.target})
                    }, {
                        success(resp) {
                            let map = JSON.parse(resp)
                            _this.keyTemplateMap = Object.assign({}, _this.keyTemplateMap, {[_this.target]: map})
                        }
                    })
                }
                let map = this.keyTemplateMap != null ? this.keyTemplateMap[this.target] : null
                return map == null ? {} : map
            },
            selectedKeyDef() {
                if (this.selectedKey == null || this.currentKeyMap == null || !(this.selectedKey in this.currentKeyMap)) {
                    return ""
                } else {
                    return JSON.stringify(this.currentKeyMap[this.selectedKey], null, "    ")
                }
            },
        },
        watch: {
            target(val) {
                this.selectedKey = null
            }
        },

        methods: {
            execute() {
                if (!this.checkRequiredFields()) {
                    return
                }
                let _this = this
                RequestUtils.request({
                        uri: _this.queryAllApi,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: RequestUtils.toUrlQueryString({
                            cluster: _this.target,
                            command: _this.command
                        })
                    }, {
                        success(resp) {
                            if (resp === '<nil>') {
                                resp = "\"<nil>\""
                            }
                            _this.data = resp
                        },
                        fail: _this.handleFail
                    }
                )
            },
            showError(msg) {
                this.errorMsg = msg
            }
            ,
            handleFail(code, resp) {
                let _this = this
                this.$refs.loginFrame.handleFail(code, resp, function (code, resp) {
                    _this.errorMsg = resp
                })
            }
            ,
            checkRequiredFields() {
                this.errorMsg = ""
                if (!this.command) {
                    this.showError("Requires command")
                    return false
                }
                if (!this.target) {
                    this.showError("Requires cluster")
                    return false
                }
                return true
            }
            ,
            showDetail(key) {
                this.selectedKey = key
                let config = this.currentKeyMap[key]
                if (config.type === 'hash') {
                    this.command = 'hgetall ' + key
                } else {
                    this.command = 'get ' + key
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
                    if (_this.targets) {
                        _this.target = _this.targets[0]
                    }
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
