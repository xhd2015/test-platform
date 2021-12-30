<template>
    <!--the json detail panel, and  type definition-->
    <div style="display: flex;flex-direction: column;justify-content: center;align-items: center">
        <div style="display: flex">
        <button>Load from File</button>
        <input placeholder="json file or excel"/>
        </div>
        <hr width="100%"/>
        <h2>{{preview ? "Preview" : "Editing..."}}</h2>
        <!--either preview or pasted content-->
        <div  style="border: 1px solid;height: 300px;width: 50%;">
            <div v-show="preview" style="background-color: lightyellow;width: 100%;height: 100%" @dblclick="exitPreview">
                [
                  <div v-for="item in previewContent">{{ JSON.stringify(item) }}</div>
                ]
            </div>
            <div v-show="!preview" @focusout="enablePreview" style="width: 100%;height: 100%">
                <textarea ref="valueEditor" style="outline: none;width: 100%;height: 100%;resize: none;" placeholder="JSON Array of Objects"></textarea>
            </div>
        </div>

        <button @click="submit">Confirm</button>
    </div>
</template>

<script>
    module.exports = {
        name: "JSONContentPanel",
        components: {},
        props: ["maxLines"],
        data() {
            return {
                loadFile: "",
                content: [],
                preview:true
            }
        },
        methods: {
            query() {

            },
            enablePreview(){
              if(!this.preview){
                  this.togglePreview()
              }
            },
            exitPreview(){
                if(this.preview){
                    this.togglePreview()
                }
            },
            togglePreview(){
                if(!this.preview){
                    let editorContent = this.$refs.valueEditor.value
                    if(!editorContent){
                        alert("No content")
                        return
                    }
                    let arr
                    try{
                        arr = JSON.parse(editorContent)
                    }catch (e) {
                        alert("Invalid json:"+ e.toString())
                        return
                    }
                    if(arr.constructor !== Array){
                        alert("Content must be array")
                        return
                    }
                    this.content = arr
                }else{
                    this.$refs.valueEditor.value = JSON.stringify(this.content)
                    // does not work
                    // let _this = this
                    // Vue.nextTick(function(){
                    //     _this.$refs.valueEditor.focus()
                    // })
                }
                this.preview = !this.preview
            },
            submit(e){
                this.$emit("submit",e)
            }
        },
        computed: {
            dbClient() {
                return new WebSQLClient("jsontools")
            },
            effectiveMaxLines() {
                return this.maxLines != null && this.maxLines > 0 ? this.maxLines : 20
            },
            previewContent() {
                return this.content == null || this.content.length < this.effectiveMaxLines ? this.content : this.content.slice(0, this.effectiveMaxLines)
            }
        }
    }
</script>

<style scoped>

</style>
