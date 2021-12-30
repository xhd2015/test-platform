<template>
    <div>
        <label>Server:</label>
        <select v-model="userModel.server">
            <option value="test">test</option>
            <option value="pre">pre</option>
        </select>
        <br/>

        <label>Registry:</label>
        <select v-model="userModel.registry">
            <option v-for="r in registryList" :value="r">
                {{r}}
            </option>
        </select>

        <span>  --OR--  </span>

        <label>Provider:</label>
        <input placeholder="127.0.0.1:20880" v-model="userModel.model.provider"/> <br/>


        <label>Group:</label>
        <input placeholder="" v-model="userModel.model.group"/> <br/>

        <label>Version:</label>
        <input placeholder="1.0.0" v-model="userModel.model.version"/> <br/>

        <label>Interface:</label>
        <input placeholder="com.example.ExampleFacade" v-model="userModel.model.interface" style="width: 500px"/>

        <label>Method:</label>
        <input placeholder="invoke" v-model="userModel.model.method" style="width: 250px"/> <br/>

        <label>Args:</label>
        <div>[</div>
          <button @click="userModel.argArr.push('')">+</button>
          <div v-for="(arg,idx) in userModel.argArr">
              <span>[{{idx}}]:</span> <textarea v-model="userModel.argArr[idx]" style="width: 600px"></textarea> <button @click="userModel.argArr.splice(idx,1)">-</button>
          </div>
        <div>]</div>

        <br/>

        <button @click="request">Request</button>

        <button @click="saveConfig">Save Config</button>

        <button @click="loadConfig">Load Config</button>
        <button @click="clear">Clear</button>

        <hr/>
        <result-area :text="userModel.result" :error="userModel.error" possible-json="true"></result-area>
    </div>
</template>

<script>
    module.exports = {
        name: "DubboTools",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue')
        },
        props: [],
        data() {
            return {
                registryMap : {
                    test:['dev','test','press'],
                    pre:['pre','prd'],
                },
                userModel:{
                    server:"test",
                    registry:"test",
                    model:{
                        provider:"",
                        group:"",
                        version:"1.0.0",
                        interface:"",
                        method:"",
                        args:""
                    },
                    error:false,
                    argArr:[""],
                    result:"",
                },
                dubboInvokeApi:'/convenient/invoke/dubbo',/* produces json */
            }
        },
        computed:{
            registryList(){
                return this.registryMap[this.userModel.server]
            }
        },
        watch:{
           'server':function(newVal,oldVal){
               if (newVal!==oldVal){
                   if(newVal === 'pre'){
                       this.userModel.registry = 'pre'
                   }else if(newVal==='test'){
                       this.userModel.registry = 'test'
                   }
               }
           }
        },

        methods: {
            request(){
                this.result = ""
                let _this = this
                if(!this.userModel.model.interface){
                    alert("Requires interface")
                    return
                }
                if(!this.userModel.model.method){
                    alert("Requires method")
                    return
                }
                let arr = []
                for(let a of this.userModel.argArr){
                    try {
                        arr.push(JSON.parse(a))
                    }catch (e) {
                        alert("Argument parse error:" + a + ", error:" + e.toString())
                        return
                    }
                }

                this.userModel.model.args = JSON.stringify(arr)
                RequestUtils.request(
                    {
                        uri: RequestUtils.makeUrl(_this.dubboInvokeApi,   {server: _this.userModel.server,registry: _this.userModel.registry }),
                        headers:RequestUtils.HEADER_FORM,
                        data: RequestUtils.toUrlQueryString(_this.userModel.model),
                        async:true
                    },
                         {
                        success(resp) {
                            _this.userModel.result = resp
                        },
                             fail: _this.handleFail
                    }
                )
            },
            clear(){
                this.userModel.result=''
                this.userModel.error=false
            },
            showError(msg){
               this.userModel.result = msg
               this.userModel.error = true
            },

            handleFail(statusCode,resp){
                if (statusCode === 401) {
                    this.showError("Requires login")
                    window.open("login.html", "_blank")
                } else {
                    this.showError("Server response error:" + resp)
                }
            },
            showError(msg){
               alert(msg)
            },
            saveConfig(){
                let name = "Dubbo"
                if(this.userModel.model.interface){
                    name = name + "_" + this.userModel.model.interface
                }
                if(this.userModel.model.method){
                    name = name + "_" + this.userModel.model.method
                }
                if(this.userModel.model.version){
                    name = name + "_" + this.userModel.model.version
                }
                if(this.userModel.model.group){
                    name = name + "_" + this.userModel.model.version
                }
                if(!name.endsWith(".json")){
                    name = name +".json"
                }

                FileUtils.chooseFileToSave(JSON.stringify(this.userModel),name,"application/json")
            },

            loadConfig(){
                let _this = this
                FileUtils.chooseFileToRead(function(content){
                    try {
                        let jsContent = JSON.parse(content)
                        if(!["test","pre"].includes(jsContent.server)){
                            throw "Invalid server:" + jsContent.server + ", should be test,pre"
                        }
                        if(jsContent.argArr == null){
                            jsContent.argArr=[""]
                        }
                        if(jsContent.argArr.constructor !== Array){
                            throw  "args should be array:" + jsContent.argArr
                        }
                        // set defaults
                        jsContent.error = !!jsContent.error
                        _this.userModel = jsContent
                    }catch (e) {
                        alert("Error load content, error:" + e.toString())
                    }
                })
            }

        },
        mounted() {

        }
    }
</script>

<style scoped>

</style>
