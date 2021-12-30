<template>
    <div>
        <label>Arguments:</label>
        <button @click="load">Load...</button>
        <button @click="save">Save...</button>
        <br/>

        <textarea style="width: 100%;height: 200px" v-model="args"></textarea> <br/>
	<button @click="addRef('arg')">Add Argument</button> 
	<div v-for="(argRef,idx) in argRefs">
	    <div>
	      <input v-model="argRef.name"/>
	      <span @click="argRef.show = !argRef.show">
	      	<span v-if="argRef.show">▼</span>
		<span v-else>▶</span>
	      </span>
	    </div> 
	    <div v-show="argRef.show">
	      <button @click="removeRef('arg',idx)">Remove</button> <br/>
	      <textarea style="width: 100%; height: 200px" v-model="argRef.content"></textarea>
	    </div>
	</div>
	<br/>
	<label>Function:</label>
	<textarea style="width: 100%; height: 200px" v-model="func"></textarea> <br/>
	<button @click="addRef('func')">Add Function</button>
	<div v-for="(funcRef,idx) in funcRefs">
	    <div>
	      <input v-model="funcRef.name"/>
	      <span @click="funcRef.show = !funcRef.show">
	      	<span v-if="funcRef.show">▼</span>
		<span v-else>▶</span>
	      </span>
	    </div> 
	    <div v-show="funcRef.show">
	      <button @click="removeRef('func',idx)">Remove</button> <br/>
	      <textarea style="width: 100%; height: 200px" v-model="funcRef.content"></textarea>
	    </div>
	</div>
        <br/>
	<hr/>
	<button @click="toggleAutoTransfer">{{ autoTransfer ? "Disable":"Enable" }} Auto Transfer</button>
	<button @click="saveResult">Save Result</button>
	<button @click="saveResultAndFunction">Save Result &amp; Function</button>
	<result-area :text="this.funcResult" :error="this.funcError" :pure-json="false" ref="result"></result-area>
    </div>
</template>

<script>
    module.exports = {
        name: "FunctionTransfer",
        components: {
            'result-area': httpVueLoader('./common/ResultArea.vue'),
        },
        props: [],
        data() {
            return {
	        argRefs:[],
		funcRefs:[],
	        autoTransfer:true,
		funcResult:"",
		funcError:false,
		objCache:{},
                args: 
`{
    id:"",
}`,
		func:
		// the fourth is context
`function(context,config) {
    
}`
            }
        },

        methods: {
	        recordChange(){
	            WindowUtils.setWindowContentChanged() 
		},
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
	    load(){
                let _this = this
                FileUtils.chooseFileToRead(function (result, filename) {
		 _this.funcError=false
	         try{
		     let res = JSON.parse(result)
		     _this.args = res["args"]
		     _this.func = res["func"]
		     _this.argRefs = res["argRefs"]
		     _this.funcRefs = res["funcRefs"]
		 }catch(e){
		    _this.funcError = true
		    _this.funcResult = e
		 }
	        })
	    },
	    save(){
	        let context = this.context
		let id
		if(!context.error){
		    id = context.arg.id
		}
	        let fileName = (id!=null && id!="") ? `${id}` : "template"
                fileName = fileName + "_" + DateUtils.jsDateToYYYYMMDD_HHMMSS() + ".json"
	        let res = {"args":this.args, "func":this.func, argRefs: this.argRefs, funcRefs: this.funcRefs }
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
	    saveResultAndFunction(){
	        this.save()
		this.saveResult()
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
	    parseObject(content){
	        return this.parseContent(content, {isScript:true,useLargeNumber:true})
	    },
	    parseFunction(content){
	        return this.parseContent(content, {isScript:true,useLargeNumber:true})
	    },
	    // options:
	    //     - isScript: if the content is a javascript script when true, or just pure json when false
	    //     - useLargeNumber: when isScript==true, should big numbers be represented as BigInt
	    //                       when isScript==false, this option is true when using JSON-bigint, false when using native JSON
	    parseContent(content,options){
	           if(!content)return content
                   let {isScript,useLargeNumber} = options
		   isScript = !!isScript
		   useLargeNumber = !!useLargeNumber
		   let cache = this.objCache[content]
		   if(cache!=null && typeof cache.obj !== 'undefined' && cache.isScript===isScript && cache.useLargeNumber===useLargeNumber){
		         return cache.obj 
		   }
		   let obj
		   if(isScript){
		      if(useLargeNumber){
		      try{
		         content = AstUtils.trasferLargeNumber("(" + content +")").trim()
			 if(content.endsWith(";")){
			     content = content.slice(0,content.length-1)
			  }
		       }catch(e){
		             console.log("trasferLargeNumber error ignored:",e)
		       }
		      }
		      obj = ObjectUtils.loadCode(content)
		   }else{
		      obj = JSON.parse(content)
		   }
		   this.objCache = {obj,isScript,useLargeNumber}
		   return obj
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
		        context.funcs[funcRef.name] = this.parseFunction(funcRef.content)
		     }catch(e){
		          this.setError(`loading func ${funcRef.name}:` + e)
			  context.error = true
			  return context
		     }
		}
		try{
		   context.func = this.parseFunction(this.func)
		}catch(e){
		    this.setError(`loading func:` + e)
		    context.error = true
		    return context
		}
		// largenumber + eval => JSON
		for(let argRef of this.argRefs){
		       // we do not support using context in the argument, because we would cache content
			try{
			    context.args[argRef.name] = this.parseObject(argRef.content)
			}catch(e){
		          this.setError(`loading arg ${argRef.name}:` + e)
			  context.error = true
			  return context
			}
		}
		try{
		   context.arg = this.parseObject(this.args)
		}catch(e){
		    this.setError("loading arg:" + e)
		    context.error = true
		    return context
		}
		return context
	    },
        },
        watch: {
	   args(){
	       this.recordChange()
	       this.debouncedAutoEvaluate()
	   },
	   func(){
	       this.recordChange()
	       this.debouncedAutoEvaluate()
	   },
	   argRefs:{
	       deep:true,
	       handler(){
		   this.recordChange()
	           this.debouncedAutoEvaluate()
	       }
	   },
	   funcRefs:{
	      deep:true,
	      handler() {
		   this.recordChange()
	           this.debouncedAutoEvaluate()
	       }
	   },
	},
        created(){
            this.debouncedAutoEvaluate = _.debounce(this.autoEvaluate, 200)
        },
    }
</script>

<style scoped>

</style>
