<template>
    <div style="display: inline">
        <label  v-if="label">{{label}}</label><textarea @input="updateValue($event.target.value)" :value="textValue" :placeholder="placeholder"></textarea>
    </div>
</template>

<script>
    module.exports = {
        name: "LabelTextArea",
        components: {},
        props: {
            "value": Object,
            "type": Function,// Number, String(default), Boolean
            "label": String,
            "placeholder":String
        },
        data() {
            return {

            }
        },

        methods: {
            updateValue(val) {
                this.$emit('input', StringUtils.toType(val, this.valueType))
            }
        },

        computed: {
            valueType() {
                return this.type == null ? String : this.type
            },
            textValue(){
                return  StringUtils.toType(this.value, String)
            }
        },
        watch: {

        },

        created: function () {
        },
        updated() {
            // console.log("updated")
        },
        mounted() {

        }
    }
</script>

<style scoped>


</style>
