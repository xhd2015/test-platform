<template>
    <div>
        <span v-if="title"><label>{{title}}</label> <br/></span>
        <toggle :options="viewModes" v-model="viewMode"></toggle>
        <div v-if="viewMode === 'form'" class="json-form-panel">
            <typed-json-form :value='internalValue' :label='label' :type="type" :key-type="keyType"
                             :element-type="elementType"
                             :type-map="typeMap" :placeholder="placeholder" :show-style="showStyle"
                             :true-option='trueOption' :false-option="falseOption" :options="options"
                             @input="internalValue = $event;debouncedEmitValue()" :start-element="startElement" :end-element="endElement" :level="level"></typed-json-form>
        </div>
        <div v-else-if="viewMode === 'json'">
            <json-editor :value="internalValue" @input="internalValue = $event;debouncedEmitValue()"></json-editor>
        </div>
    </div>
</template>

<script>
    console.log('loading JsonForm')
    module.exports = {
        name: "JsonForm",
        components: {
            'toggle': httpVueLoader('./Toggle.vue'),
            'json-editor': httpVueLoader('./JsonEditor.vue'),
            'typed-json-form': httpVueLoader('./TypedJsonForm.vue'),
        },
        props: {
            title: String,
            value: Object,
            label: String,
            type: String,
            keyType: String, // only for map
            elementType: String, // only for array and map,
            typeMap: Object, // only for ObjectType
            placeholder: String,
            showStyle: String,
            trueOption: Object,// String or {text:..., value}
            falseOption: Object,
            options: Array,// for enum
            level: { type:Number, default:0}, // level to indent(starting level = 0)
            startElement: {type: String, default: ""},//  '&nbps;&nbsp;&nbsp;&nbsp;'
            endElement: {type: String, default: ""},// '<br/>'
        },
        data() {
            return {
                viewModes: ["form", "json"],
                viewMode: "form",// json,form
                internalValue: null
            }
        },
        computed: {},

        methods: {
            emitValue() {
                this.$emit('input', this.internalValue)
            }
        },

        watch: {
            value: {
                handler(val) {
                    this.internalValue = val
                },
                deep: true
            },
            // internalValue: {
            //     handler(val) {
            //         this.debouncedEmitValue(val)
            //     },
            //     deep: true
            // }
        },

        created: function () {
            this.internalValue = this.value
            this.debouncedEmitValue = _.debounce(this.emitValue, 200)
        },
    }

</script>

<style scoped>

</style>
