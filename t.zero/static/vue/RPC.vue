<template>
    <div>
	<!--specify -->
	<!--will load a list of thrift files, common files are fetch from -->
        <button @click="load">Load...</button>
        <button @click="save">Save...</button>
	<br/>
	<br/>
	<label style="font-size: larger;font-weight: bold;">Thrift Files Setup</label>
	<hr/>
	<br/>
	<label>Branch:</label>
	<input v-model="branch"/>
	<br/>
	<label>Thrift File:</label>
	<input v-model="thriftFile" style="width: 300px"/>
	<br/>
	<label>Service:</label>
	<input v-model="service" disabled="true" readonly="true" style="width: 200px"/>
	<br/>

        <!--
	<label style="font-size: larger;font-weight: bold;">Override Files:</label>
	-->
	<label>Override Files:</label>
	<br/>
	<button @click="addOverrideFile()">Add Override File</button>
	<div v-for="(overrideFile,idx) in overrideFiles">
	    <div>
	      <input v-model="overrideFile.path" placeholder="thrift file path..." style="width: 300px"/>
	      <span @click="overrideFile.show = !overrideFile.show">
	      	<span v-if="overrideFile.show">▼</span>
		<span v-else>▶</span>
	      </span>
	    </div> 
	    <div v-show="overrideFile.show">
	      <button @click="removeOverrideFile(idx)">Remove</button> 
	      <button @click="loadThriftFile(idx)">Upload</button> <br/>
	      <textarea style="width: 100%; height: 200px" v-model="overrideFile.content" placeholder="thrift file content..."></textarea>
	    </div>
	</div>
        <br/>
	<!--will update the file model-->
	<button @click="updateThriftSetup">Update</button>
	<result-area :text="this.loadThriftMessage" :error="this.loadThriftError" :pure-json="false"></result-area>
	<!--
	<div v-show="this.loadThriftError">
	</div>
	-->
	<br/>
	<br/>

	<label style="font-size: larger;font-weight: bold;">Reuqest Config</label>
	<hr/>
	<!--auto generated config-->

	<br/>
	<label>PSM:</label>
	<input v-model="psm" style="width: 256px"/>
	&nbsp;&nbsp;
	<select @change="if($event.target.value){ let info = candidateAddresses[Number($event.target.value)];address = info.addr;env=info.detail.env }"> 
	   <option value="">--Select Address--</option>
	   <option v-for="(addrInfo,idx) in candidateAddresses" :value="idx">{{prettyAddrInfo(addrInfo)}}</option>
	</select>
	<br/>
	<span v-show="listPSMError">
	   <result-area :text="listPSMResult" :error="listPSMError" :pure-json="false"></result-area>
	   <br/>
	</span>
	<label>Address:</label>
	<input v-model="address"/>
	<br/>
	<label>Env:</label>
	<input v-model="env"/>
	<br/>
	<label>Timeout:</label>
	<input v-model="timeout"/>
	<br/>

	<label>Requests:</label>
	<br/>
	<button @click="addRequest()">Add Request</button>
	<div v-for="(request,idx) in requests">
	    <div>
	      <input v-model="request.name" placeholder="request name..."/>
	      <span @click="request.show = !request.show">
	      	<span v-if="request.show">▼</span>
		<span v-else>▶</span>
	      </span>
	    </div> 
	    <div v-show="request.show">
	      <button @click="removeRequest(idx)">Remove</button> <br/>
	      <label>Method:</label>
	      <select v-model="request.method" @change="request.argument =request.method?rpcMethods[request.method].request:''">
	          <option value="">--Select A Method--</option>
		  <option v-for="(conf,method) in rpcMethods" :value="method">{{method}}</option>
	      </select>
	      <br/>
	      <label>Argument:</label>
	      <textarea style="width: 100%; height: 200px" v-model="request.argument"></textarea>
	      <br/>
	      <button @click="emitRequest(idx)">Request</button>
	      <div><label>LogID:</lable><span>{{request.logid}}</span></div>
	      <result-area :text="request.result" :error="request.isError" :pure-json="true"  :input-may-not-be-js-expr="true"><result-area>
	    </div>
	</div>
        <br/>
	<hr/>
<!--
	<button @click="toggleAutoTransfer">{{ autoTransfer ? "Disable":"Enable" }} Auto Transfer</button>
	<button @click="saveResult">Save Result</button>
	<result-area :text="this.funcResult" :error="this.funcError" :pure-json="false" ref="result"></result-area>
	-->
    </div>
</template>

<script>
    module.exports = {
        name: "RPC",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue'),
        },
        props: [],
        data() {
            return {
	        thriftLoadApi:"/fetch/rpc-inspect-thrift",
		thriftCallApi:"/fetch/rpc-request",
		logidApi:"/fetch/genlogid",
                listPSMApi:"/fetch/get-psm-addr",
		transferLargeNumberApi:"/fetch/transfer-largenumber",
		listPSMResult:"",
		listPSMError:false,
	        branch:"master",
		// the entry point thrift file
		thriftFile:"",
		service:"",
		// 
		// a list of file object: { path:, content: }
		overrideFiles:[],
		// method name to method config {request, response}
		rpcMethods:{}, 
		schema:"",
		// can make multiple requests
		// each request has an argument, can either be a function,or just a json object
		// {arg,filter,result}
		psm:"",
		candidateAddresses:[],
		address:"",
		env:"",
		timeout:0,
		requests:[], 

		// this is shared by all requests
	        argRefs:[],
		funcRefs:[],

	        autoTransfer:true,
		funcResult:"",
		loadThriftError:false,
		loadThriftMessage:"",
		loadError:false,
		persistFields:[
		         "thriftLoadApi", 
			 "branch", 
			 "thriftFile", 
			 "service", 
			 "overrideFiles", 
			 "rpcMethods", 
			 "schema",
			 "psm",
			 "address", 
			 "timeout", 
			 "requests", 
			"loadThriftError", 
			"loadThriftMessage"
			],
                args: 
`{
    id:"",
}`,
		func:
		// the fourth is context
`function(arg,args,funcs) {
    
}`
            }
        },

        methods: {
	        clearError(){
		    this.funcError = false
		},
		setError(e){
		    this.funcError = true
		    this.funcResult = e
		},
		autoEvaluate(){
			if(this.autoTransfer){
				this.evaluate()
			}
		},
		prettyAddrInfo(addrInfo){
		    let addr = addrInfo.addr.padEnd(30)
		    let cluster = `cluster:${addrInfo.detail.cluster.trim()}`.padEnd(24)
		    let env = `env:${addrInfo.detail.env.trim()}`
		    return `${addr}(${env}, ${cluster})`
		},
                listPSMAddr(){
		    let _this = this
		    this.candidateAddresses = []
		    this.listPSMError = false
		    this.listPSMResult = ""
		    if(!this.psm){
		        return
		    }
		    RequestUtils.request({
                        uri: RequestUtils.makeUrl(this.listPSMApi,{ "_": this.psm }),
                        async:true
                    },
                         {
                           success(resp) {
			        // split and filter non-empty
				let strcompare = (a,b,highest)=>{
				    if(a===b)return 0
				    if(a===highest)return -1
				    if(b===highest)return 1
				    if(a<b)return -1
				    return 1
				}
				let ipInfo =  JSON.parse(resp)
				ipInfo.sort( (a,b) => {
				    let c = strcompare(a.detail.env,b.detail.env,"prod")
				    if(c===0){
				       return strcompare(a.detail.cluster,b.detail.cluster,"default")
				    }
				    return c
				})
			        _this.candidateAddresses = ipInfo
                        },
                        fail(statusCode,resp){
			     _this.listPSMResult= resp
		             _this.listPSMError = true
			     console.log("error list psm address:code, resp = ",statusCode,resp)
			}
                    }
                )
		},
            evaluate() {
	        context = this.context
		if(context.error){
		    return
		}
	        this.clearError()
		try{
		    this.funcResult = ObjectUtils.callFunc({func: context.func, args:[context,context.arg]})
		}catch(e){
		    this.setError(e)
		    if(context.funcs.onError!=null){
		        ObjectUtils.callFunc({func: context.funcs.onError, args:[context,e]})
		    }else{
		        console.log(e)
		    }
		}
            },
	    toggleAutoTransfer(){
	        this.autoTransfer = !this.autoTransfer
	    },
	    loadThriftFile(idx){
	        let overrideFile = this.overrideFiles[idx]
                FileUtils.chooseFileToRead(function (result, filename) {
		    overrideFile.content = result
	        })
	    },
	    load(){
                let _this = this
                FileUtils.chooseFileToRead(function (result, filename) {
		 _this.loadThriftError = false
		 _this.loadThriftMessage = ""
	         try{
		     let res = JSON.parse(result)
    		    for(let field of _this.persistFields){
		        _this[field] = res[field]
		      }
		 }catch(e){
		    _this.loadThriftError= true
		    _this.loadThriftMessage = e
		 }
	        })
	    },
	    save(){
	        let context = this.context
	        let fileName = (this.service!=null && this.service!="") ? `RPC-${this.service}.json` : "RPC.json"
	        let res = {}
		for(let field of this.persistFields){
		    res[field] = this[field]
		}

		res = JSON.stringify(res)
                FileUtils.chooseFileToSave(res, fileName, FileUtils.CONTENT_JSON)
	    },
	    saveResult(){
	        if(this.funcError){
		    return
		}
	        let context = this.context
		let id = context.arg.id
	        let fileName = (id!=null && id!="") ? `${id}_result.json` : "result.json"
	        let res = this.funcResult
                FileUtils.chooseFileToSave(res, fileName, FileUtils.CONTENT_JSON)
	    },
	    addRef(refType){
	        let obj = this.argRefs
		let prefix = "key"
		let initContent = ""
		if(refType == "func"){
		    obj = this.funcRefs
		    prefix = "func"
		    initContent = `function(context){
    
}`
		}
	        let n = obj.length
		let i = n
		while(true){
		   let name = `${prefix}${i++}`
		   let found = false
		   for(let ref of obj){
		       if(ref.name == name){
		            found = true
			    break
			}
		   }
		   if(!found){
		       obj.push({
		            name:name,
		            show:true,
			    content:initContent,
		       })
		       return
		   }
		}
	    },
	    removeRef(refType,idx){
	        let refs = refType == "func" ? this.funcRefs : this.argRefs
	        refs.splice(idx,1)
	    },
	    addOverrideFile(){
	        this.overrideFiles.push({
		    show:true,
		    path:"",
		    content:""
		})
	    },
	    removeOverrideFile(idx){
	        this.overrideFiles.splice(idx,1)
	    },
	    addRequest(){
	        this.requests.push({
		    show:true,
		    name:"",
		    method:"",
		    logid:"",
		    argument:`{
    
}`,
                    isError:false,
		    result:"",
		})
	    },
	    removeRequest(idx){
	        this.requests.splice(idx,1)
	    },
	    updateThriftSetup(){
	         this.loadThriftError = false
		 this.loadThriftMessage = "loading..."
		 try{
		     this.requestThriftSetup()
		 }catch(e){
		     this.loadThriftMessage = e
		     this.loadThriftError = true
		     console.log("error load thrift:",e)
		 }
	    },
	    requestThriftSetup(){
	        let _this = this
		// must request the same origin
                RequestUtils.request(
                    {
                        uri: _this.thriftLoadApi,
                        headers:RequestUtils.HEADER_JSON,
                        data: JSON.stringify({
			    branch: _this.branch,
			    thriftFile: _this.thriftFile,
			    overrideFiles: _this.overrideFiles,
			}),
                        async:true
                    },
                         {
                        success(resp) {
				let obj
			   try{
			       obj = JSON.parse(resp)
			   }catch(e){
				   _this.loadThriftMessage = "load error:"+e
				   _this.loadThriftError = true
				   return
			   }
			   let methods = Object.keys(obj.methods).map( e => e)
			   _this.loadThriftMessage = `loaded ${methods.length} methods:\n  ${methods.join(", ")}`
			   _this.service = obj.service
			   _this.rpcMethods = obj.methods
			   _this.schema = obj.schema
			   // request, response are string,just fine
                        },
                        fail(statusCode,resp){
			     _this.loadThriftMessage = resp
		             _this.loadThriftError = true
			     console.log("error load thrift:code, resp = ",statusCode,resp)
			}
                    }
                )
	    },
	    emitRequest(idx){
	       let request = this.requests[idx]
	        request.isError = false
		request.result = "\"requesting...\""
		 try{
		     this.makeRequest(request)
		 }catch(e){
		     request.result = e
		     request.isError = true
		     console.log("error requesting:",e)
		 }
	    },
	    makeRequest(request){
	        let _this = this
		// try to get request.argument as a javascript object
		// if just a string ,ok, we'll accept it
		let context = {}
		let arg = request.argument
		let start = Date.now()
		try{
		    arg = AstUtils.trasferLargeNumber("(" + arg +")").trim()
		    if(arg.endsWith(";")){
		        arg = arg.slice(0,arg.length-1)
		    }
		}catch(e){
		    console.log("[ignored]transfer error:",e)
		}
		let end = Date.now()
		console.log(`[perf]transfer cost:${end- start}ms`)

		try{
		    arg = ObjectUtils.loadCodeWithContext(context,arg)
		}catch(e){
		   console.log("load code error, ignored:",e)
		   // ignore 
		}
		if(arg!=null && arg.constructor === Function){
		     try{
		        arg = ObjectUtils.callFunc({func: arg, args:[]})
		     }catch(e){
			    request.isError = true
			    request.result = "error load argument:" + e
			    return
		     }
		}
		// need transfer to string
		if(arg!=null && arg.constructor!==String){
			// if has env set
			if(_this.env){
				if(!arg.Base || !arg.Base.Extra || !arg.Base.Extra["env"]){
					arg.Base = arg.Base || {}
					arg.Base.Extra = arg.Base.Extra || {}
					arg.Base.Extra["env"] =  _this.env
				}
			}
			arg = JSON.stringify(arg)
		}
		// clear last recorded logid
		request.logid = ""



		// must request the same origin
                RequestUtils.request(
                    {
                        uri: _this.thriftCallApi,
                        headers:RequestUtils.HEADER_JSON,
                        data: JSON.stringify({
			    psm: _this.psm,
			    address: _this.address,
			    method: request.method,
			    schema: _this.schema,
			    arg: arg,
			    timeout: _this.timeout
			}),
                        async:true
                    },
                         {
                        success(resp) {
			    let respData = JSON.parse(resp)
			    request.isError = false
			    request.logid = respData.logid
			    request.result = respData.result
                        },
                        fail(statusCode,resp){
		             request.isError = true
			     request.result = resp
			     console.log("error call thrift:code, resp = ",statusCode,resp)
			}
                    }
                )
	    }

        },
        computed: {
	    context(){
	        this.clearError()
		// compute function firstly
		let context = {
		    funcs:{},
		    args:{},
		    func:null,
		    arg:null,
		    error:false,
		}
		// func does not require context
		for(let funcRef of this.funcRefs){
		     try{
		        context.funcs[funcRef.name] = ObjectUtils.loadCode(funcRef.content)
		     }catch(e){
		          this.setError(`loading func ${funcRef.name}:` + e)
			  context.error = true
			  return context
		     }
		}
		try{
		   context.func = ObjectUtils.loadCode(this.func)
		}catch(e){
		    this.setError(`loading func:` + e)
		    context.error = true
		    return context
		}
		for(let argRef of this.argRefs){
		     try{
		        context.args[argRef.name] = ObjectUtils.loadCodeWithContext(context,argRef.content)
		     }catch(e){
		          this.setError(`loading arg ${argRef.name}:` + e)
			  context.error = true
			  return context
		     }
		}
		try{
		   context.arg = ObjectUtils.loadCodeWithContext(context,this.args)
		}catch(e){
		    this.setError("loading arg:" + e)
		    context.error = true
		    return context
		}
		return context
	    },
        },
        watch: {
	   psm(){
	      WindowUtils.setWindowContentChanged() 
	      this.debouncedListPSMAddr()
	   },
	   args(){
	       WindowUtils.setWindowContentChanged() 
	       this.debouncedAutoEvaluate()
	   },
	   func(){
	       WindowUtils.setWindowContentChanged() 
	       this.debouncedAutoEvaluate()
	   },
	   argRefs:{
	       deep:true,
	       handler(){
	           WindowUtils.setWindowContentChanged() 
	           this.debouncedAutoEvaluate()
	       }
	   },
	   funcRefs:{
	      deep:true,
	      handler() {
	           WindowUtils.setWindowContentChanged() 
	           this.debouncedAutoEvaluate()
	       }
	   },
	},
        created(){
            this.debouncedAutoEvaluate = _.debounce(this.autoEvaluate, 200)
	    this.debouncedListPSMAddr = _.debounce(this.listPSMAddr,500)
        },
    }
</script>

<style scoped>

</style>
