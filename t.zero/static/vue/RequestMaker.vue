<template>
    <!--Template capabilities:  useable > promotion
       prompt should be useable
       unmodifiable is a promotion
    -->
    <div>

        <login-frame v-show="showLogin"
                     style="position: absolute;border: 0;width: 100%;height:100%;justify-content: center; background-color: #55667730"
                     class="flex-h" @close="onUserCancelLogin" @login="onUserLogin">
        </login-frame>

        <button @click="loadSettings">Load...</button>
        <span style="width: 20px"/>
        <button @click="saveSettings">Save...</button>
        <span style="width: 20px"/>
        <button @click="uploadSettings">Upload</button>
        <span style="width: 20px"/>

        <div v-if="model.enableInternal" style="display: inline">
            <button @click="toggleShowInternal">Show Internal</button>
            <div v-if="model.showInternal">
                <!-- <div>
                  <label>Fields:</label>
                  <span>{{model.fields}}</span>
                </div>-->
                <div>
                    <label>Proxy Port:</label>
                    <span>{{proxyPort}}</span>
                </div>
                <div>
                    <label>Model:</label>
                    <span>{{JSON.stringify(model)}}</span>
                </div>
            </div>
        </div>
        <hr style="width: 100%"/>

        <div>
            <label for="name">Name:</label>
            <div
                    style="display: inline;width:  80%"
                    @dblclick="document.getElementById('name').disabled=false;document.getElementById('name').focus()"
                    @focusout="document.getElementById('name').disabled=true"
            >
        <textarea
                placeholder="profile name"
                v-model="model.name"
                id="name"
                rows="1"
                disabled="true"
                class="light-unmodifiable noresize"
                style="width:300px"
        ></textarea>
            </div>
        </div>
        <div>
            <label for="uri">URL:</label>
            <div
                    @dblclick="document.getElementById('uri').disabled=false;document.getElementById('uri').focus()"
                    @focusout="document.getElementById('uri').disabled=true"
                    class="inline"
            >
        <textarea
                placeholder="http://ads-test.test/misc/hash"
                id="uri"
                v-model="model.uri.value"
                :style="{...model.uri.style}"
                ref="uri"
                class="light-unmodifiable bolder"
                disabled="true"
        ></textarea>
            </div>
        </div>

        <table>
            <tbody>
            <tr>
                <div
                        @dblclick="document.getElementById('description').disabled=false;document.getElementById('description').focus()"
                >
                    <label for="description">Description:</label>
                    <div
                            @focusout="document.getElementById('description').disabled=true"
                            style="display: inline"
                    >
              <textarea
                      :style="{...model.description.style}"
                      placeholder="URL description..."
                      disabled="true"
                      id="description"
                      class="horizontal-area light-unmodifiable"
                      v-model="model.description.value"
                      @input="DocumentUtils.updateTextareaHeight($event.target)"
              ></textarea>
                    </div>
                </div>
            </tr>
            </tbody>
        </table>
        <!--
          <div
            :style="{...model.description.style, display:'inline'}"
            :contenteditable="model.description.editable"
            :id="'description'"
            class="no-outline"
            @focusout="model.description.editable = false;model.description.value = document.getElementById('description').innerText;Vue.nextTick(function(){document.getElementById('description').childNodes[0].remove()})"
          >
            <span>{{model.description.value}}</span>
            <span
              v-if="!model.description.editable && !model.description.value"
              class="palceholder-hint"
            >URL description...</span>
        </div>-->

        <div>
            <label for="content-type">Content-Type:</label>
            <select id="content-type" v-model="model.contentType">
                <option value="url-form">QUERY</option>
                <option value="form">FORM</option>
                <option value="json">JSON</option>
                <option value="custom">Custom</option>
            </select>
            <input v-if="model.contentType==='custom'" v-model="model.customContentType"
                   placeholder="application/octet-stream"/>
        </div>


        <label @click="model.useAdvanced = !model.useAdvanced">Advanced <span v-if="!model.useAdvanced">▶</span><span
                v-else>▼</span></label> <br/>
        <div v-if="model.useAdvanced">
            <input type="checkbox" v-model="model.withPreServer"/><label
                @click="model.withPreServer = !model.withPreServer">With Pre
            Server</label>
        </div>

        <toggle :options="['table','json']" label="Editor Mode:" v-if="model.contentType==='json'"
                v-model="model.jsonEditorModel" @input="updateFieldsHeight"></toggle>

        <toggle :options="['plain text','binary']" label="Data Mode:" v-if="model.contentType==='custom'"
                v-model="model.customEditorMode"></toggle>

        <!--GROUP: non-custom,  non-json or json-table-->
        <div v-if="model.contentType === 'custom'">
            <!--custom content as hex string-->
            <textarea v-model="model.customContent" style="width: 75%;height: 300px"
                      :placeholder="model.customEditorMode==='plain text'?'plain text...':'hexadecimal string representation of byte array,for example: 01aabe'"></textarea>
        </div>
        <div v-else-if="model.contentType!=='json' || model.jsonEditorModel==='table'">
            <button @click='addField("","","")'>Add a Field</button>

            <table style="border-collapse: collapse;table-layout: fixed" border="1px solid"
                   v-if="model.fields!=null && model.fields.length>0">
                <thead>
                <tr>
                    <th>Name</th>
                    <th>Value</th>
                    <th>Operation</th>
                </tr>
                </thead>

                <!-- div in tbody is automatically ignored -->
                <tbody v-for="(field,idx) in model.fields" :key="field.name" :id="'fieldBody' + idx ">
                <tr>
                    <!-- nextTick allows you to do something after you have changed the data and VueJS has updated the DOM based on your data change, but before the browser has rendered those changed on the page.

        Normally, devs use native JavaScript function setTimeout to achieve similar behavior. But, using setTimeoutrelinquishes control over to the browser before it gives control back to you via your callback.

                    Let's say, you changed some data. Vue updates DOM based on the data. Mind you the DOM changes are not yet rendered to the screen by the browser. If you used nextTick, your callback gets called now. Then, browser updates the page. If you used setTimeout, your callback would get called only now.-->

                    <!--
        to create two-way bind on div with innerText,  you must retrieve the newest element because it may have been changed.

        If two inputs event happens:
        input1 ->  element1
        input2 ->  element2

        it may seem that: element1 != element2
        because element2 is re-rendered by Vue
        So you use $refs.ELEME to refer the unchanged element.

        use the following code to test:
                 @input.self="if(window.events == null){ window.events = []};events.push($event);
                 if(window.refsHistory == null ) { window.refsHistory = []}; refsHistory.push($refs.fieldsName[idx]);
                 "

        assert:  assert events[0].target !== events[1].target
                 assert refsHistory[0] !== refsHistory[1]
                    -->

                    <!-- <td style="overflow: auto;">
                      <div
                        :class="{focusable: field.editable, editing:field.editable}"
                        @dblclick="field.editable=!field.editable;if(!field.editable){field.inputing = false }  else {Vue.nextTick(()=> $refs.fieldsName[idx].children[0].focus())}"
                        style="display:flex;min-width: 4em;resize: both;overflow: auto;"
                        ref="fieldsName"
                      >
                        <div
                          style="display: inline"
                          class="no-outline"
                          v-if="field.editable || field.name"
                          :contenteditable="field.editable"
                          @focus="if(field.editable){DocumentUtils.toSelectionEnd()}"
                          @focusout="if(!field.inputing) { field.editable=false }"
                          @input.self="field.name = $refs.fieldsName[idx].innerText;field.inputing=true;Vue.nextTick(function(){ $refs.fieldsName[idx].children[0].focus() ; field.inputing =false})"
                        >{{field.name}}</div>
                        <span
                          v-else
                          style="font: italic; color: grey; pointer-events:none"
                        >Input a Field name</span>
                      </div>
                    </td>-->

                    <td
                            :style="{...model.fields[idx].name.style,'word-break': 'break-all'}"
                            :id="'fieldNameInner' + idx"
                            class="field-name"
                            @dblclick="field.name.editable = !field.name.editable;if(field.name.editable){ Vue.nextTick(()=> { document.getElementById('fieldName'+idx).focus();})}"
                    >
                        <div
                                @dblclick="document.getElementById('fieldName' + idx).disabled=false;document.getElementById('fieldName' + idx).focus();"
                                @focusout="document.getElementById('fieldName'+idx).disabled=true"
                        >
                <textarea
                        style="outline: 0px solid transparent; border: 0; resize: none;background-color: transparent;font-family:Microsoft Yahei,sans-serif;font-weight: bolder"
                        placeholder="field name..."
                        disabled="true"
                        :id="'fieldName'+idx"
                        v-model="field.name.value"
                ></textarea>
                        </div>

                        <!-- <div
                          :contenteditable="field.name.editable"
                          :id="'fieldName'+idx"
                          class="no-outline"
                          @focusout="field.name.editable=false;field.name.value = document.getElementById('fieldName' + idx).innerText"
                        >
                          <span>{{field.name.value}}</span>
                          <span
                            v-if="!field.name.editable && !field.name.value"
                            class="palceholder-hint"
                          >field name</span>
                        </div>-->
                    </td>

                    <td
                            :style="{...field.content.style,'word-break': 'break-all',resize: 'horizontal', overflow:'auto','background-color':'palegoldenrod'}"
                            :id="'fieldContentInner' + idx"
                    >
                        <!-- simple  two-way binding like this does not work
                              @input='field.value = $evnet.target.innerText'
                              {{field.value}}
                      it causes render problems, the input and the {{field.value}} with co-exist:
                              <userInput> {{field.value}}
                        -->

                        <textarea
                                style="outline: 0px solid transparent; border: 0; resize: none;background-color: transparent;width: 100%;height:auto;font-family:Microsoft Yahei"
                                placeholder="field content..."
                                :id="'fieldContent'+idx"
                                v-model="field.content.value"
                                @input="DocumentUtils.updateTextareaHeight($event.target)"
                        ></textarea>
                    </td>
                    <td>
                        <button @click="remove(idx)" style="background-color:darkgrey">Remove a Field</button>
                    </td>
                </tr>
                <tr>
                    <!--the essence of content editable:
                           on input,  a Text is inserted to head of children of the target editable
                        add a boolean flag to tell Vue if the dom should be rendered

                        vue may detect different property change, for example,: div.span.p

                        if p changed, Vue can re-render p, span or dev
                        if Vue decide just to repaint p, then change made by user input remains
                    -->
                    <!--
                         children = elements
                         childNodes = Node, such as Text

                         never show the content
                    -->
                    <td
                            colspan="3"
                            class="description-line"
                            @dblclick="field.hint.editable = !field.hint.editable;if(field.hint.editable){ Vue.nextTick(function(){ document.getElementById('fieldHint'+idx).focus()})}"
                    >
                        <div style="display:flex">
                            <span class="description-bar">Description:</span>
                            <div
                                    :style="{...field.hint.style,display:'inline','word-break': 'break-all'}"
                                    :id="'fieldHintWrapper' + idx"
                                    @dblclick="document.getElementById('fieldHint' + idx).disabled=false;document.getElementById('fieldHint' + idx).focus();"
                                    @focusout="document.getElementById('fieldHint'+idx).disabled=true"
                            >
                  <textarea
                          style="outline: 0px solid transparent; border: 0; resize: none;background-color: transparent;font-style: italic;font-family:Microsoft Yahei;width:100%"
                          placeholder="field note..."
                          disabled="true"
                          :id="'fieldHint'+idx"
                          v-model="field.hint.value"
                          @input="DocumentUtils.updateTextareaHeight($event.target)"
                  ></textarea>
                            </div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="3" style="height:20px;background-color: #005354 "></td>
                </tr>
                </tbody>
            </table>
        </div>
        <div v-else>
            <json-editor :value="fieldsToJson" @input="jsonToFields($event)"></json-editor>
        </div>

        <!-- TODO the size for table above, adjust it-->
        <div>
            <button @click="addHeader">Add a Header</button>
            <!-- as the $refs array's order is not reliable, so we avoid using it-->
            <div>
                <div style="display:flex;" v-for="(header,idx) in model.headers" :key="header.name">
                    <!-- after using http-vue-loader, v-model get un-focused when input once -->
                    <input
                            placeholder="header name"
                            :id="'headerNames' + idx"
                            :value="header.name"
                            @input="header.name = document.getElementById('headerNames'+idx).value;Vue.nextTick(function(){document.getElementById('headerNames'+idx).focus() })"
                    />
                    <textarea
                            placeholder="header content"
                            v-model="header.content.value"
                            :id="'headerContentInner' + idx"
                            :style="{...header.content.style}"
                    ></textarea>
                    <button @click="removeHeader(idx)">Remove a Header</button>
                </div>
            </div>
        </div>

        <button @click="request">Request</button>
        <span style="width:20px"></span>
        <button @click="preview">Preview</button>
        <span style="width:20px"></span>
        <button @click="previewCurl">Preview(Curl)</button>
        <span style="width:20px"></span>
        <button @click="previewCurlWithProxy">Preview(Curl,with Proxy)</button>
        <span style="width:20px"></span>
        <button @click="clearMessage">Clear</button>
        <br/>


        <hr style="width: 100%"/>

        <result-area :text="responseAreaText" :error="model.error" possible-json="true"></result-area>

        <div v-if="model.showHeaders">
            <div v-for="responseHeader in model.responseHeaders" :key="responseHeader.header">
                <label>{{responseHeader.header}}</label> ：
                <label>{{responseHeader.value}}</label>
            </div>
        </div>
    </div>
</template>

<script>

    module.exports = {
        components: {
            'login-frame': httpVueLoader('./LoginFrame.vue'),
            'result-area': httpVueLoader('./common/ResultArea.vue'),
            'toggle': httpVueLoader('./common/Toggle.vue'),
            'json-editor': httpVueLoader('./common/JsonEditor.vue')
        },
        data: function () {
            return {
                model: {
                    name: "Untitled",
                    description: {
                        value: "",
                        style: {
                            width: "75%"
                        },
                        editable: false
                    },
                    uri: {
                        value: "",
                        style: {
                            width: "80%"
                        }
                    },
                    /* IMPORTANT: when adding fields here, should you add them to setDefaults() too*/
                    contentType: "url-form",
                    customContentType: '',
                    customContent: '',
                    fields: [],
                    headers: [],
                    showHeaders: false,
                    response: "",
                    responseHeaders: [],
                    enableInternal: true,
                    /*debug feature*/
                    showInternal: false,
                    error: false,
                    message: "",
                    useAdvanced: false,
                    withPreServer: false,
                    jsonEditorModel: 'table',
                    customEditorMode: 'plain text'
                },
                myProxyPort: null,
                showLogin: false,
                pendingRequest: null,
                initQuery: DocumentUtils.getCurrentUrlQuery(),
                configApi: '/user/configJson',
                loginApi: '/user/login',
                uploadApi: '/user/saveConfig',
                proxyPortApi: '/config/proxyPort'
            };
        },

        methods: {
            updateFieldsHeight() {
                if (this.model.jsonEditorModel === 'table') {
                    let _this = this
                    Vue.nextTick(function () {
                        _this.updateTextareaSizes(_this.model.fields.length, 'fieldContent');
                    })
                }
            },
            remove(idx) {
                this.removeForTypeSized("fields", idx);
            },
            removeHeader(idx) {
                this.removeForTypeSized("headers", idx);
            },
            addField(name, value, hint) {
                this.model.fields.push({
                    name: {
                        value: name,
                        style: {
                            width: "100px",
                            height: "50px"
                        },
                        editable: false
                    },
                    content: {
                        value: value,
                        style: {
                            width: "500px",
                            height: "50px"
                        }
                    },
                    hint: {
                        value: hint,
                        style: {
                            width: "100%"
                        }
                    }
                });
            },

            addHeader() {
                this.model.headers.push({
                    name: "",
                    content: {
                        value: "",
                        style: {
                            width: "270px"
                        }
                    }
                });
            },
            removeForTypeSized(type, idx) {
                this.model[type].splice(idx, 1);
            },
            toggleShowInternal() {
                this.updateModel()
                this.model.showInternal = !this.model.showInternal
            },
            request() {
                let _this = this
                this.withErrorHandled("cannot request", function () {
                    _this.doRequest()
                })
            },
            doRequest() {
                let config = this.getRequestConfig()
                if (!config.uri) {
                    this.showError("requires uri");
                    return;
                }
                let _this = this;
                let requestConfig = {
                    init() {
                        _this.clearMessage();
                        return true
                    },
                    cancel: null,
                    config,
                    success(response) {
                        _this.setResponse(response)
                    },
                    fail: _this.handleFail,
                }
                this.requestOrLogin(requestConfig)
            },
            handleFail(statusCode, response) {
                if (statusCode === 0) {
                    this.showError(
                        "Internal error, check the browser console to see what happened internally.The exception message is:\n" +
                        response
                    );
                } else {
                    this.showError(`code = ${statusCode} , response = ${response}`);
                }
            },
            preview() {
                let _this = this;
                this.withErrorHandled("Cannot preview", () => {
                    _this.setResponse(JSON.stringify(RequestUtils.processRequest(_this.getRequestConfig())));
                });
            },
            previewCurl() {
                let _this = this;
                this.withErrorHandled("Cannot preview curl", () => {
                    let cfg = _this.getRequestConfig();
                    cfg.proxyPort = null;
                    _this.setResponse(RequestUtils.toCurlRequest(cfg))
                });
            },
            previewCurlWithProxy() {
                let _this = this;
                this.withErrorHandled("Cannot preview curl with proxy", () => {
                    let cfg = _this.getRequestConfig();
                    cfg.proxyPort = _this.proxyPort
                    if (cfg.proxyPort == null) {
                        throw "Cannot get proxy port";
                    }
                    _this.setResponse(RequestUtils.toCurlRequest(cfg));
                });
            },
            clearMessage() {
                this.model.error = false;
                this.model.message = "";
                this.model.response = "";
                this.model.responseHeaders = [];
            },
            withErrorHandled(cannotDoSomething, f) {
                this.clearMessage();
                try {
                    return f();
                } catch (error) {
                    this.showError((cannotDoSomething + "," || "") + "error:" + error);
                }
                return null;
            },
            showError(msg) {
                this.model.error = true;
                this.model.message = msg;
            },
            loadSettings() {
                let _this = this;
                FileUtils.chooseFileToRead(function (content) {
                    _this.loadSettingsWithString(content)
                });
            },
            loadSettingsWithString(content) {
                let _this = this
                let loadModel = JSON.parse(content);
                this.setDefaults(loadModel);
                this.model = loadModel;

                Vue.nextTick(function () {
                    _this.updateTextareaSizes(_this.model.fields.length, "fieldContent");
                    _this.updateTextareaSizes(_this.model.fields.length, "fieldHint");
                    DocumentUtils.updateTextareaHeight(
                        document.getElementById("description")
                    );
                });
            },

            updateTextareaSizes(length, idPrefix) {
                let n = length;
                for (let i = 0; i < n; i++) {
                    DocumentUtils.updateTextareaHeight(
                        document.getElementById(idPrefix + i)
                    );
                }
            },
            setDefaults(model) {
                this.ensureFieldNonEmpty(model, "headers", []);
                this.ensureFieldNonEmpty(model, "fields", []);
                model.useAdvanced = !!model.useAdvanced
                model.withPreServer = !!model.withPreServer
                model.jsonEditorModel = model.jsonEditorModel || "table"
                model.customContentType = model.customContentType || ""
                model.customContent = model.customContent || ""
                model.customEditorMode = model.customEditorMode || "plain text"
            },
            saveSettings() {
                if (!this.model.name) {
                    this.showError("Requires name")
                    return
                }
                this.updateModel()
                FileUtils.chooseFileToSave(
                    JSON.stringify(this.model),
                    this.model.name + ".json",
                    "application/json"
                );
            },
            uploadSettings() {
                if (this.model.contentType === 'json' && this.model.jsonEditorModel !== 'table') {
                    alert("Please set editor mode to table")
                    return
                }
                let _this = this
                this.requestOrLogin({
                    init() {
                        if (!_this.model.name) {
                            _this.showError("Requires name")
                            return false
                        }
                        _this.updateModel()
                        return true
                    },
                    config: {
                        uri: RequestUtils.makeUrl(_this.uploadApi, {
                            key: _this.model.name
                        }),
                        data: JSON.stringify(_this.model),
                        headers: [{"name": "Content-Type", "value": "application/json;charset=utf-8"}],
                        async: false
                    }
                })
            },
            updateStyles() {
                this.updateSinglePropertyStyle(this.model, "uri", "uri", "width");
                this.updateSinglePropertyStyle(this.model, "uri", "uri", "height");
                this.updateSinglePropertyStyle(
                    this.model,
                    "description",
                    "description",
                    "width"
                );
                this.updateSinglePropertyStyle(
                    this.model,
                    "description",
                    "description",
                    "height"
                );
                this.updateStyleProperty(
                    this.model.fields,
                    "content",
                    "fieldContentInner",
                    "width"
                );
                this.updateStyleProperty(
                    this.model.fields,
                    "content",
                    "fieldContentInner",
                    "height"
                );
                this.updateStyleProperty(
                    this.model.fields,
                    "hint",
                    "fieldHintWrapper",
                    "width"
                );
                this.updateStyleProperty(
                    this.model.fields,
                    "hint",
                    "fieldHintWrapper",
                    "height"
                );

                this.updateStyleProperty(
                    this.model.headers,
                    "content",
                    "headerContentInner",
                    "width"
                );
                this.updateStyleProperty(
                    this.model.headers,
                    "content",
                    "headerContentInner",
                    "height"
                );
            },
            updateStyleProperty(modelArray, modelProp, refProp, styleProp) {
                if (modelArray) {
                    let n = modelArray.length;
                    for (let i = 0; i < n; ++i) {
                        modelArray[i][modelProp].style[styleProp] = document.getElementById(
                            refProp + i
                        ).style[styleProp];
                    }
                }
            },
            updateSinglePropertyStyle(obj, prop, refProp, styleProp) {
                obj[prop].style[styleProp] = document.getElementById(refProp).style[
                    styleProp
                    ];
            },
            updateStyleSize(ref) {
                this.model.style[ref].width = this.$refs[ref].style.width;
                this.model.style[ref].height = this.$refs[ref].style.height;
            },
            updateStyleSizeForArr(ref) {
                let arr = this.model.style[ref];
                for (let i = 0; i < arr.length; ++i) {
                    this.model.style[ref][i].width = this.$refs[ref][i].style.width;
                    this.model.style[ref][i].height = this.$refs[ref][i].style.height;
                }
            },
            /**
             * send a request, and if returned failed,
             *
             * @param requestConfig {config,init, cancel, success, fail}
             * @param callback
             */
            requestOrLogin(requestConfig) {
                if (!requestConfig.config) {
                    throw "Requires config"
                }
                let _this = this
                if (requestConfig.init) {
                    if (!requestConfig.init()) {
                        return
                    }
                }
                RequestUtils.request(requestConfig.config, {
                    success: requestConfig.success,
                    fail(statusCode, response) {
                        if (statusCode === 401) {
                            if (requestConfig.cancel) {
                                requestConfig.cancel()
                            }
                            _this.pendingRequest = requestConfig
                            _this.showLogin = true
                        } else if (requestConfig.fail) {
                            requestConfig.fail(statusCode, response)
                        }
                    }
                })
            },
            onUserLogin(param) {
                if (!param.userName || !param.password) {
                    this.showError("Requires userName and password")
                    return
                }
                param.password = encMe(param.password, 'cbe92676735640ac9e26dbf6386acec1')

                this.showLogin = false
                let r = this.pendingRequest
                this.pendingRequest = null
                let _this = this
                this.withErrorHandled("Login failed", function () {
                    _this.doLogin(param, {
                        success(resp) {
                            if (r) {
                                _this.requestOrLogin(r)
                            }
                        },
                        fail: _this.handleFail
                    })
                })
            },
            onUserCancelLogin() {
                this.showLogin = false
                this.pendingRequest = null
            },
            doLogin(param, callback) {
                RequestUtils.request({
                        uri: RequestUtils.makeUrl(this.loginApi, param),
                        async: false
                    },
                    callback
                )
            },
            updateModel() {
                this.updateStyles()
            },
            getRequestConfig() {
                return Object.assign({}, this.requestConfig())
            },
            //================== utitlty method=============
            bindField(obj, field, event) {
                obj[field] = event.target.innerText;
            },
            ensureFieldNonEmpty(obj, key, value) {
                if (obj[key] == null) {
                    obj[key] = value;
                }
            },
            setResponse(response) {
                this.model.response = response;
            },
            jsonToFields(json) {
                let fields = this.model.fields
                this.model.fields = []
                for (let k in json) {
                    let existingField
                    for (let f of fields) {
                        if (f.name.value === k) {
                            existingField = f
                            break
                        }
                    }
                    let value = json[k]
                    if (value != null) {
                        if (value.constructor !== String) {
                            value = JSON.stringify(value, null, "    ")
                        }
                    }
                    if (existingField != null) {
                        this.addField(k, value, existingField.hint.value)
                    } else {
                        this.addField(k, value)
                    }
                }
            },
            /*caller should catch exception of this method*/
            baseMethodDataHeadersConfig() {
                let config = {
                    uri: this.model.uri.value,
                    method: "GET",
                    headers: {},
                    data: null,
                    async: true
                }
                if (this.model.headers) {
                    for (let header of this.model.headers) {
                        config.headers[header.name] = header.content.value;
                    }
                }
                let fieldParam = []
                for (let field of this.model.fields) {
                    fieldParam.push({name: field.name.value, value: field.content.value});
                }
                if (this.model.contentType === "url-form") {
                    config.method = "GET";
                    config.uri = RequestUtils.makeUrl(config.uri, fieldParam)
                } else if (this.model.contentType === "form") {
                    config.method = "POST";
                    config.data = RequestUtils.toUrlQueryString(fieldParam)
                    config.headers["Content-Type"] = "application/x-www-form-urlencoded";
                } else if (this.model.contentType === "json") {
                    config.method = "POST";
                    config.data = JSON.stringify(this.fieldsToJson);
                    config.headers["Content-Type"] = "application/json";
                } else if (this.model.contentType === 'custom') {
                    config.method = "POST"
                    if (this.model.customEditorMode === 'binary') {
                        config.data = DataUtils.decodeHexString(this.model.customContent)
                    } else if (this.model.customEditorMode === 'plain text') {
                        config.data = this.model.customContent
                    }
                    config.headers["Content-Type"] = this.model.customContentType
                } else {
                    this.showError("Unknown content type:" + this.model.contentType);
                    return;
                }
                return config;
            },
            requestConfig() {
                let baseConfig = this.baseMethodDataHeadersConfig()
                if (baseConfig == null) {
                    return null
                }
                let config = Object.assign({}, baseConfig)
                config.useCurl = false
                if (this.usePreServer) {
                    if (config.uri == null) {
                        this.showError("Curl/Pre requires uri")
                        return null
                    }

                    let headers = []
                    if (config.headers) {
                        for (let name in config.headers) {
                            headers.push({name, value: config.headers[name]})
                        }
                    }
                    let requestModel = {
                        "method": config.method,
                        "uri": config.uri,
                        "headers": headers,
                        "data": config.data
                    }
                    // request with pre server
                    config.uri = "/paas/curl/requestPre"
                    config.method = "POST"
                    config.headers = {"Content-Type": "application/json"}
                    config.data = JSON.stringify(requestModel)
                } else {
                    let sameDomain = true
                    if (config.uri) {
                        config.uri = config.uri.trim()
                        if (config.uri.match(/^[0-9A-Za-z_\-]+:\/\/.*/)) {
                            let url = new URL(config.uri)
                            if (url.hostname !== location.hostname || url.port !== location.port) {
                                sameDomain = false
                            }
                        }
                    }
                    if (!sameDomain) {
                        config.proxyPort = this.proxyPort
                    }
                }
                return config;
            },
        },
        computed: {
            proxyPort() {
                if (this.myProxyPort != null) {
                    return this.myProxyPort;
                }
                let _this = this;
                this.withErrorHandled("Cannot get proxy port", function () {
                    _this.requestOrLogin({
                        config: {
                            uri: _this.proxyPortApi,
                            async: false
                        },
                        success(resp) {
                            _this.myProxyPort = parseInt(resp);
                        }
                    })
                })
                return this.myProxyPort;
            },
            usePreServer() {
                return this.model.useAdvanced && this.model.withPreServer
            },
            fieldsToJson() {
                let dataObj = {};
                for (let field of this.model.fields) {
                    dataObj[field.name.value] = JsonUtils.getPossibleJSONObject(field.content.value);
                }
                return dataObj
            },
            responseAreaText() {
                return this.model.error ? this.model.message : this.model.response
            }
        },
        watch: {},
        mounted() {
            let _this = this
            let cfgKey = this.initQuery.initKey
            if (cfgKey) {
                this.requestOrLogin({
                    config: {
                        uri: _this.configApi + '?key=' + encodeURIComponent(cfgKey),
                        async: true
                    },
                    success(resp) {
                        _this.withErrorHandled("Cannot loading settings", function () {
                            _this.loadSettingsWithString(resp)
                        })
                    },
                    fail: _this.handleFail
                })
            }
        }
    }
</script>

<style scoped>
    @import "../css/base.css";

    .focusable {
        /* border: 1px solid black; */
        margin-right: 10px;
    }

    .focusable.editing {
        border: 1px solid greenyellow;
    }

    /* for editable content, no outline */
    .no-outline {
        outline: 0px solid transparent;
    }

    .ligth-unmodifiable[contenteditable="false"] {
        background-color: gainsboro;
        /* font: italic gray; */
    }

    .palceholder-hint {
        font-style: italic;
        color: gray;
    }

    .field-name {
        background-color: aliceblue;
    }

    .description-line {
        font-style: italic;
        color: gray;
    }

    .description-bar {
        font-style: italic;
    }

    textarea.light-unmodifiable {
        outline: 0px solid transparent;
        border: 0;
        font-family: Microsoft Yahei, sans-serif;
        font-style: italic;
        background-color: transparent;
    }

    textarea.light-unmodifiable:disabled {
        background-color: rgba(196, 196, 196, 0.692);
    }

    textarea.light-unmodifiable:enabled {
        border: 1px solid;
        font-style: normal;
    }

    .horizontal-area {
        width: 100%;
        resize: horizontal;
        border: 1px solid;
    }

    .noresize {
        resize: none;
    }

    .inline {
        display: inline
    }

    .bolder {
        font-weight: bolder;
    }
</style>
