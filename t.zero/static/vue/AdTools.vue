<template>
    <div>
        <div @click="showInformation=!showInformation">
            <h1 style="text-decoration: underline">Information <span v-if="!showInformation">▶</span><span
                    v-else>▼</span></h1>
        </div>
        <div v-if="showInformation">
            <label>Ad Detail:</label> <input placeholder="id or uuid" v-model="infoAdId"/>
            <div>
                <textarea class="pre" style="height: 300px;width: 500px;border: 1px solid;"
                          v-model="adDetail"></textarea>
            </div>
            <label>Position Detail:</label> <input placeholder="id or uuid" v-model="infoPositionId"/>
            <div>{{positionDetail}}</div>
            <label>Media Detail:</label> <input placeholder="id or uuid" v-model="infoMediaId"/>
            <div>{{mediaDetail}}</div>

            <button @click="infoConfirm">Query</button>
        </div>
        <h1 style="text-decoration: underline">Request Ad ▼</h1>
        <label>Requests:</label>
        <select v-model="requestFrom">
            <option value="browser">Browser</option>
            <option value="ssp">SSP</option>
            <option value="dsp">DSP</option>
        </select>

        <select v-model="env">
            <option value="test">test</option>
            <option value="pre">pre</option>
            <option value="prd">prd</option>
        </select>
        <label-checkbox v-model="dspModel.isAdnet" label="AdNet"></label-checkbox>

        <div>
            <div v-if="requestFrom === 'dsp'">
                <label>Provider(Optional):</label><input v-model="dspModel.provider" placeholder="127.0.0.1:20880"
                                                         style="width: 160px"/> <br/>
                <div>
                    <label>Request ID:</label><input v-model="dspModel.requestId"/>
                </div>

                <h4>Client Info</h4>
                <json-form title="" :value="{}" ref="clientJson"
                           type="ObjectType"
                           :type-map="AdTypes.ClientInfoDTO" @input="console.log($event)" start-element="&nbsp;&nbsp;&nbsp;&nbsp;" end-element="<br/>"></json-form>

                <h4>Position Info</h4>
                <json-form title="" :value="{}" ref="positionJson"
                           type="ObjectType"
                           :type-map="AdTypes.PositionDTO" @input="console.log($event)" start-element="&nbsp;&nbsp;&nbsp;&nbsp;" end-element="<br/>"></json-form>
            </div>
            <div v-else-if="requestFrom === 'ssp'">
                <span>Implementing soon...</span>
            </div>
            <div v-else-if="requestFrom === 'browser'">
                <span>Implementing soon...</span>
            </div>

        </div>

        <button @click="request">Request</button>
        <hr/>
        <result-area :error="error" :text="result" :pure-json="true" ref="resultArea"></result-area>
    </div>
</template>

<script>
    let serverMap = {
        dev: "test", test: "test", press: "test",
        pre: "pre", prd: "pre"
    }
    let defaultsMap = {
        test: {
            clientInfo:
                {
                    "imei": "512307988100012", // shaw的imei：512307988100012，
                    "oaid": "",
                    "vaid": "",
                    "clientPackage": "com.?.browser", // 浏览器包名
                    "clientVersion": 17000, // 浏览器版本
                    "netType": 2, // 网络类型,2=WiFi
                    "mediaId": "956c419caa6c4c5ba1661bd2c95dc19c", // 线上线下的浏览器媒体uuid均一样
                    "model": "? X27",
                    "ip": "127.0.0.1",
                    "an": "9",
                    "av": 28, // Android 版本号, Android Q = 29,
                    "u": "",
                    "sysVersion": "10.2"
                },
            positionInfo: {
                "id": 1,
                "uuid": "6f63bd4df1114804a8ebacf4a2ba1ab7", // 推荐页第四位,虚拟广告位28, 数千个候选
                "adTypes": "1,2,8",// 支持的广告类型
                "supportH5Download": 1, // 支持H5，基本上全部广告都是H5广告
                "mediaType": 1,// 来源类型,防止空指针异常 1.自有媒体 2.广告联盟
                "materialsNorms": [{"id": 62}, {"id": 288}, {"id": 1}, {"id": 375}, {"id": 2}, {"id": 409}, {"id": 3}, {"id": 250}, {"id": 4}, {"id": 602}, {"id": 208}], // 支持的物料规格
                "strategy": {}, // 防止空指针异常,
                "shieldAdvertiserIds": [],
                "platformType": 1,
            }
        },
        pre: {
            clientInfo: {},
            positionInfo: {}
        },
        prd: {
            clientInfo: {},
            positionInfo: {}
        }
    }

    module.exports = {
        name: "AdTools",
        components: {
            'toggle': httpVueLoader('./common/Toggle.vue'),
            'json-editor': httpVueLoader('./common/JsonEditor.vue'),
            'result-area': httpVueLoader('./common/ResultArea.vue'),
            'label-checkbox': httpVueLoader('./common/LabelCheckbox.vue'),
            'label-input': httpVueLoader('./common/LabelInput.vue'),
            'label-text-area': httpVueLoader('./common/LabelTextArea.vue'),
            'label-select': httpVueLoader('./common/LabelSelect.vue'),
            'json-form':httpVueLoader('./common/JsonForm.vue')
        },
        props: [],
        data() {
            return {
                requestFrom: "dsp",
                env: "test",
                clientViewModes: ['form', 'json'],
                clientViewMode: 'form',
                positionViewModes: ['form', 'json'],
                positionViewMode: 'form',
                dspModel: {
                    provider: "",
                    isAdnet: false,
                    requestId: AdUtils.makeRequestId(),
                    clientInfo: {
                        mediaId: null,
                        clientPackage: null,
                        clientVersion: null,
                        netType: null,
                        imei: null,
                        oaid: null,
                        vaid: null,
                        an: null,
                        av: null,
                        ip: null,
                        model: null,
                        positionId: null, // the same with positionInfo[0].uuid
                        u: null,
                        sysVersion: null
                    },
                    positionInfo: [
                        {
                            "id": null,
                            "uuid": null,
                            "adTypes": null,
                            "supportH5Download": null,
                            "materialsNorms": null,
                            "strategy": null,
                            "shieldAdvertiserIds": null,
                            "platformType": null
                        }
                    ],
                },
                dubboInvokeApi:
                    '/convenient/invoke/dubbo', /* produces json */
                error:
                    false,
                result:
                    "",
                //====================FOR information panel=======================
                redisGetApi:
                    '/paas/redis/get',
                adsCluster:
                    'ads-master',
                showInformation:
                    false,
                infoResult:
                    "",
                infoAdId:
                    null,
                infoPositionId:
                    null,
                infoMediaId:
                    null,
                adDetail:
                    "",
                positionDetail:
                    "",
                mediaDetail:
                    ""
            }
        },
        computed: {
            testServer() {
                return serverMap[this.env]
            },
            currentDefaults() {
                return defaultsMap[this.env]
            },
            clientInfoView() {
                return this.defaulted(this.dspModel.clientInfo, this.currentDefaults.clientInfo)
            },
            positionInfoView() {
                return this.defaulted(this.dspModel.positionInfo[0], this.currentDefaults.positionInfo)
            }
        },

        methods: {
            defaulted(val, def) {
                let view = {}
                for (let k in def) {
                    view[k] = def[k]
                }
                for (let k in val) {
                    let v = val[k]
                    if (v) {
                        view[k] = v
                    }
                }
                return view
            },
            request() {
                this.result = ""
                let _this = this
                if (!this.dspModel.requestId) {
                    alert("Requires request id")
                    return
                }
                let clientModel = this.clientInfoView
                if (!clientModel.imei) {
                    alert("Requires imei")
                    return
                }
                let positionModel = [this.positionInfoView]
                RequestUtils.request(
                    {
                        uri: RequestUtils.makeUrl(_this.dubboInvokeApi, {server: _this.testServer}),
                        headers: RequestUtils.HEADER_FORM,
                        data: RequestUtils.toUrlQueryString({
                            registry: _this.env,
                            provider: _this.dspModel.provider, /*default*/
                            version: "", /*default*/
                            group: "", /*default*/
                            'interface': 'com.fulton_shaw.tools.facade.intf.AdRequestFacade',
                            'method': 'reqAd',
                            args: JSON.stringify([
                                '"' + _this.dspModel.requestId + '"',
                                clientModel,
                                positionModel
                            ])
                        }),
                        async: true
                    },
                    {
                        success(resp) {
                            _this.result = resp
                        }, fail(code, resp) {
                            _this.error = true
                            _this.text = resp
                        }
                    }
                )
            },
            infoConfirm() {
                if (this.infoAdId) {
                    let id = this.infoAdId.replace("_", "")
                    this.adDetail = this.getRedis("ads:ad:detail:" + this.getIdBasedIdOrUUID(id, "ads:ad:uuid:id:"))
                }
                if (this.infoMediaId) {
                    // this.mediaDetail = this.getRedis("")
                }
            },
            getIdBasedIdOrUUID(id, mapKey) {
                if (!this.isNumber(id)) {
                    return this.getRedis(mapKey + id)
                }
                return id
            },
            isNumber(id) {
                return !isNaN(Number(id))
            },
            getRedis(key) {
                let val
                let _this = this
                RequestUtils.request({
                    uri: RequestUtils.makeUrl(_this.redisGetApi, {key, cluster: _this.adsCluster}),
                    async: false
                }, {
                    success(resp) {
                        val = resp
                    },
                    fail(code, resp) {
                        alert("Getting redis error,server says:" + resp)
                    }
                })
                return val
            }
        },
        mounted() {

        }
    }
</script>

<style scoped>
    textarea.pre {
        outline: none;
        border: none;
        resize: none;
        font-family: inherit;
    }
</style>
