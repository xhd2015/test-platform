<template>
    <!--allow json viewed in two modes: form or text editor-->
    <div style="display: inline">
        <span v-html="startElement.repeat(level-1)" v-if="level>1 && !isObjectType"></span>
        <label-input :type="Number" v-if="isNumberType" :label="label" :placeholder="placeholder" :value="value"
                     @input="$emit('input',$event)"></label-input>

        <label-checkbox :type="Boolean" :label="label" v-else-if="isBooleanType && isStyleCheckbox"
                        :placeholder="placeholder"
                        :value="value" @input="$emit('input',$event)"></label-checkbox>

        <toggle v-else-if="isBooleanType && isStyleToggle" :options="[falseOption,trueOption]" :value="value"
                @input="$emit('input',$event)" :label="label" class="boolean-type style-toggle"></toggle>

        <label-select v-else-if="isBooleanType && isStyleSelect" :label="label" :options="[falseOption,trueOption]"
                      :value="value"
                      @input="$emit('input',$event)" class="boolean-type style-select"></label-select>

        <label-input :type="String" v-if="isStringType && isStyleInput" :placeholder="placeholder" :value="value"
                     :label="label"
                     @input="$emit('input',$event)" class="string-type style-input"></label-input>

        <label-text-area :type="String" v-if="isStringType && isStyleTextArea" :placeholder="placeholder" :value="value"
                         :label="label"
                         @input="$emit('input',$event)" class="string-type style-text-area"></label-text-area>

        <toggle v-else-if="isEnumType && isStyleToggle" :options="options" :value="value" :label="label"
                @input="$emit('input',$event)"></toggle>

        <label-select v-else-if="isEnumType && isStyleSelect" :options="options" :value="value" :label="label"
                      @input="$emit('input',$event);"></label-select>

        ArrayType:
        <div style="display: inline" v-else-if="isArrayType">
            <span v-if="label"><label>{{label}}</label> <span v-html="endElement"></span></span>
            <div style="display: inline" v-for="(item,idx) in valueCopy">
                <div style="display: inline-flex">
                    <typed-json-from
                            v-bind="elementType && elementType.constructor === Object ? Object.assign(elementType,{value:item}) : {type:elementType,value:item}"
                            @input="valueCopy[idx]=$event;$emit('input',valueCopy)" :level="level+1"
                            :start-element="startElement" :end-element="endElement"></typed-json-from>
                    <button class="array-remove" @click="valueCopy.splice(idx,1);$emit('input',valueCopy)">-</button>
                </div>
                <span v-html="endElement"></span>
            </div>
            <span v-html="startElement.repeat(level)"></span>
            <button class="array-add"
                    @click="valueCopy.push(defaultValueForType(elementType));$emit('input',valueCopy)">+
            </button>
            <span v-html="endElement"></span>
        </div>

        <!--map has some problem watching-->
        MapType:
        <div style="display: inline" v-else-if="isMapType">
            <span v-if="label"><label>{{label}}</label> <span v-html="endElement"></span></span>
            <div style="display: inline" v-for="(item,idx) in mapValueCopy">
                <div style="display: inline-flex">
                    <typed-json-from :type="keyType" :value="item.key" :label="null"
                                     @input="item.key=$event;debouncedUpdateMapCopyMap()"
                                     :level="level+1" :start-element="startElement"
                                     :end-element="endElement"></typed-json-from>
                    :
                    <typed-json-from
                            v-bind="elementType && elementType.constructor === Object ? Object.assign(elementType,{value:item.value,label:null}) : {type:elementType,value:item.value,label:null}"
                            @input="item.value=$event;debouncedUpdateMapCopyMap()" :level="0"
                            :start-element="startElement"
                            :end-element="endElement"></typed-json-from>
                    <button class="array-remove" @click="mapValueCopy.splice(idx,1)">-</button>
                </div>
                <span v-html="endElement"></span>
            </div>
            <span v-html="startElement.repeat(level)"></span>
            <button class="array-add"
                    @click="mapValueCopy.push({key:defaultValueForType(keyType),value:defaultValueForType(elementType)})">
                +
            </button>
            <span v-html="endElement"></span>
        </div>

        ObjectType:
        <div style="display: inline" v-else-if="isObjectType">
            <span v-if="label"><span v-html="startElement.repeat(level-1)"
                                     v-if="level>1"></span><label>{{label}}</label> <span
                    v-html="endElement"></span></span>
            <typed-json-from v-for="(proto,key) in typeMap" v-bind='Object.assign(proto,{value:objectValue[key]})'
                             @input="objectValue[key]=$event" :level="level+1"
                             :start-element="startElement" :end-element="endElement"></typed-json-from>
        </div>
        <span v-if="isBasicType" v-html="endElement"></span>
        <!--<span v-html="endElement"></span>-->
    </div>
</template>

<script>
    // !!! IMPORTANT !!!!
    // META INFORMATION
    // {
    //     "type":ArrayType,
    //     "elementType":,//
    //     "leastSize":0,
    //     "initialSize":0,
    //
    // },
    //
    //
    // {
    //     type:NumberType, //
    //         placeholder:"",//
    // }
    //
    // {
    //     type:BooleanType,//
    //     trueValue:true,
    //     falseValue:false,
    //     trueText:...
    //     falseText:...
    //     style:toggle,checkbox(default),select
    // }
    //
    // {
    //     type:EnumType, //
    //         options:, // value and text
    //     style:toggle|select,
    // }
    //
    // {
    //     type:StringType,//
    //         large:false, // is it large
    //     placeholder:""//
    // }
    //
    // {
    //     "type":MapType<K,V>, // key value are determined, show the +
    //     "keyType":..,
    //     "valueType":....
    // }
    //
    // {
    //     "type":ObjectType, // keys are deteremined
    //     "typeMap":{
    //     // recursive
    // }
    // }
    console.log('loading TypedJsonForm')
    let DEFAULT_VALUE_MAP = {
        BooleanType: false,
        StringType: "",
        NumberType: 0,
        ObjectType: {},
        ArrayType: [],
        MapType: {}
    }
    module.exports = {
        name: "TypedJsonForm",
        components: {
            'typed-json-from': httpVueLoader('./TypedJsonForm.vue'),
            'toggle': httpVueLoader('./Toggle.vue'),
            'label-checkbox': httpVueLoader('./LabelCheckbox.vue'),
            'label-input': httpVueLoader('./LabelInput.vue'),
            'label-select': httpVueLoader('./LabelSelect.vue'),
            'label-text-area': httpVueLoader('./LabelTextArea.vue')
        },
        props: {
            value: Object,
            type: String,
            keyType: String, // only for map
            elementType: Object, // simple String or nested type {type,typeMap} only for array and map,
            typeMap: Object, // only for ObjectType
            label: String,
            placeholder: String,
            showStyle: String,
            trueOption: Object,// String or {text:..., value}
            falseOption: Object,
            options: Array,// for enum,
            level: {type: Number, default: 0}, // level to indent(starting level = 0)
            startElement: {type: String, default: ""},//  '&nbps;&nbsp;&nbsp;&nbsp;'
            endElement: {type: String, default: ""},// '<br/>'
        },
        data() {
            return {
                valueCopy: null,
                mapValueCopy: null,
                objectValue: null
            }
        },
        computed: {
            isNumberType() {
                return this.type === 'NumberType'
            },
            isBooleanType() {
                return this.type === 'BooleanType'
            },
            isStringType() {
                return this.type == null || this.type === 'StringType'
            },
            isEnumType() {
                return this.type === 'EnumType'
            },
            isBasicType() {
                return this.isNumberType || this.isBooleanType || this.isStringType || this.isEnumType
            },
            isArrayType() {
                return this.type === 'ArrayType'
            },
            isMapType() {
                return this.type === 'MapType'
            },
            isObjectType() {
                return this.type === 'ObjectType'
            },
            // style
            isStyleToggle() {
                return this.showStyle === 'toggle'
            },
            isStyleCheckbox() {
                // boolean default to checkbox
                return this.showStyle === 'checkbox' || (this.isBooleanType && !this.showStyle)
            },
            isStyleSelect() {
                return this.showStyle === 'select'
            },
            isStyleInput() {
                return this.showStyle === 'input' || ((this.isNumberType || this.isStringType) && !this.showStyle)
            },
            isStyleTextArea() {
                return this.showStyle === 'textarea'
            },
            // other
            emptyProto() {
                let o = {}
                for (let i in this.typeMap) {
                    o[i] = null
                }
                return o
            }
        },

        methods: {
            addElement() {
                console.log("addElement")
            },
            removeElement(i) {
                console.log("addElement")
            },
            updateMapCopyMap() {
                this.$emit('input', ObjectUtils.fromEntries(this.mapValueCopy))
            },
            updateObject(val) {
                this.$emit('input', val)
            },
            defaultValueForType(type) {
                let typeString = "StringType"
                if (type != null) {
                    typeString = type.constructor === String ? type : type.type
                }
                if (typeString == null) {
                    typeString = "StringType"
                }

                if (typeString === 'EnumType') {
                    let options = type != null && type.constructor === Object ? type.options : null
                    return options != null && options.length > 0 ? options[0] : null
                } else {
                    return DEFAULT_VALUE_MAP[typeString]
                }
            }
        },

        watch: {
            value: {
                handler(val, old) {
                    if (this.isArrayType) {
                        this.valueCopy = []
                        if (this.value) {
                            for (let val of this.value) {
                                this.valueCopy.push(val)
                            }
                        }
                    }
                    if (this.isMapType) {
                        // console.log("in map, val changed, val = ", val,old)
                        this.mapValueCopy = ObjectUtils.toEntries(val)
                    }

                    if (this.isObjectType) {
                        this.objectValue = Object.assign(this.emptyProto, val)
                    }
                },
                deep: true
            },
            // map has some problem watching
            // mapValueCopy: {
            //     handler(val) {
            //         console.log("in map, map value copy watch changed")
            //         this.debouncedUpdateMapCopyMap(val)
            //     },
            //     deep: true
            // },
            objectValue: {
                handler(val) {
                    // console.log("object update", val)
                    this.debouncedUpdateObject(val)
                },
                deep: true
            }
        },

        created: function () {
            if (this.isArrayType) {
                this.valueCopy = []
                if (this.value) {
                    for (let val of this.value) {
                        this.valueCopy.push(val)
                    }
                }
            }
            if (this.isMapType) {
                this.mapValueCopy = ObjectUtils.toEntries(this.value)
                // this.mapValueCopy.push([{key:"key",value:"value"}])
            }
            if (this.isObjectType) {
                this.objectValue = Object.assign(this.emptyProto, this.value)
            }
            this.debouncedUpdateMapCopyMap = _.debounce(this.updateMapCopyMap, 200)
            this.debouncedUpdateObject = _.debounce(this.updateObject, 200)
        },
    }
</script>

<style scoped>

    .map-container {
        /*border-width: 1px;*/
        /*border-style: solid;*/
    }

    .array-add {
        background-color: darkgray;
        /* border: 1px solid; */
        /* height: 5px; */
        border-radius: 6px;
        font-weight: bold;
    }

    .array-remove {
        background-color: lightgray;
        width: 10px;
        text-align: center;
        margin-right: 10px;
    }
</style>
