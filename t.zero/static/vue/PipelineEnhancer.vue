<template>
    <div>
        <label>App List:</label> <br/>
        <typed-json-form v-bind="appListProto" @input="appListProto.value=$event"></typed-json-form>
        <br/>

        <button @click="refresh">Refresh</button>
        <br/>

        <div style="display: flex;flex-wrap: wrap;">
            <div v-for="(app,idx) in appList" :class="{'app-card-a':idx%2===0,'app-card-b':idx%2!==0}">
                <label class="appname">{{app}}</label>
                <div style="display: flex;flex-wrap: wrap;margin-left: 10px">
                    <div style="display:inline-block;" v-for="template in templates">
                        <a :href="format(template.template,app)" target="_blank"
                           style="margin-right: 10px">{{template.label}}</a>
                    </div>
                </div>

                <div style="display:inline-block;margin-right: 10px;margin-left: 10px">
                    <a :href="format(pipelineTemplate.template,app)" target="_blank">{{pipelineTemplate.label}}</a>
                    <ul>
                        <li v-for="pipeline in getPipelines(app)">
                            <a :href="getPipelineUrl(pipeline.id,app)" target="_blank">{{pipeline.pipelinesName}}</a>
                            <button @click="runPipeline(app,pipeline.id)">Run</button>
                            <span v-if="statusMap[pipeline.id] && statusMap[pipeline.id].msg"
                                  :style="{color: statusMap[pipeline.id].error? 'red':'green'}">{{statusMap[pipeline.id].msg}}</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    appName = []
    module.exports = {
        components: {
            'login-frame': httpVueLoader('./LoginFrame.vue'),
            'typed-json-form': httpVueLoader('./common/TypedJsonForm.vue')
        },
        name: "LoginPage",
        data() {
            return {
                appListProto: {
                    type: "ArrayType",
                    elementType: "StringType",
                    label: "",
                    value: ["ads-intf", "ads-dsp-adnet-intf","ads-dsp-algo-proxy","ads-adnet-algo-proxy","ads-log", "ads-dsp-adnet-log", "ads-admin", "ads-dsp-data-sync", "ads-dsp-internal-service","ads-test"]
                },
                pipelineTemplate: {
                    label: '流水线',
                    template: 'http://paas.?.xyz/?url=http%3A%2F%2Fcicd.?.xyz%2Fcicd-web%2Findex.html%23%2Fcicd%2Fmultipipeline%2Flist&nodeid=${nodeId}',
                    itemTemplate: "http://paas.?.xyz/?url=http%3A%2F%2Fcicd.?.xyz%2Fcicd-web%2Findex.html%23%2Fcicd%2Fmultipipeline%2Ftabs%2Ftabsmultidetailpipeline%2F${id}&nodeid=${nodeId}",
                },
                templates: {
                    log: {
                        label: '日志',
                        template: 'http://paas.?.xyz/?url=http%3A%2F%2Flog-portal.?.xyz%2Fv2%2Findex.html%23%2Fui%2Flogsearch&nodeid=${nodeId}'
                    },
                    cfg: {
                        label: '配置',
                        template: 'http://paas.?.xyz/?url=http%3A%2F%2F?-portal.?.xyz%2Fv2%2Findex.html%23%2Fui%2FsearchAndAlteration&nodeid=${nodeId}'
                    },
                    envs:{
                        label:'部署环境',
                        template:'http://paas.?.xyz/?url=http%3A%2F%2Fcicd.?.xyz%2Fcicd-web%2Findex.html%23%2Fenvs%2Flist&nodeid=${nodeId}'
                    }
                },
                api: "/paas/cicd/pipeline/v2/list",
                urlApi: "/paas/cicd/pipeline/v2/url",
                runApi: "/paas/cicd/pipeline/v2/run",
                nodeIdMap: {},
                pipelines: {},
                urls: {},
                statusMap: {},
                appList: []
            }
        },
        computed: {},
        created() {
            this.refresh()
        },
        watch: {
            appList() {
            }
        },

        methods: {
            refresh() {
                this.appList = this.appListProto.value || []
            },
            getNodeId(appName) {
                let id = this.nodeIdMap[appName]
                if (id == null) {
                    this.nodeIdMap[appName] = id = NODE_ID_CACHE.getValue('nodeId', {appName}) || -1
                }
                return id
            },
            format(template, appName) {
                return StringUtils.formatTemplate(template, {appName, nodeId: this.getNodeId(appName)})
            },
            getPipelines(appName) {
                return PIPELINE_CACHE.getValue('pipeline', {appName}) || []
            },
            getPipelineUrl(id, appName) {
                return StringUtils.formatTemplate(this.pipelineTemplate.itemTemplate, {
                    appName,
                    id,
                    nodeId: this.getNodeId(appName)
                })
            },
            runPipeline(app, id) {
                this.statusMap = Object.assign({}, this.statusMap, {[id]: {error: false, msg: ""}})
                let _this = this
                RequestUtils.request({
                    uri: RequestUtils.makeUrl(this.runApi, {pipelines: id}),
                }, {
                    success(resp) {
                        _this.statusMap[id].msg = resp
                    }, fail(code, resp) {
                        _this.statusMap[id] = {error: true, msg: "Error"}
                    }
                })
            }
        }
    }
</script>

<style scoped>
    .app-card-a {
        display: inline-flex;
        flex-direction: column;
        border-top: 2px solid yellowgreen;
        margin-right: 20px;
        background-color: lightgoldenrodyellow;
        margin-top: 5px;
    }

    .app-card-b {
        display: inline-flex;
        flex-direction: column;
        border-top: 2px solid lightseagreen;
        margin-right: 20px;
        background-color: lavender;
        margin-top: 5px;
    }
    .appname {
        text-align: center;
        font-weight: 200;
    }
</style>
