<template>
    <div style="display: inline">
        <label v-if="label">{{label}}</label>
        <select :value="options.map((e,i)=>[e,i]).filter(e=> getOptionValue(e[0])===value).map(e=>e[1])[0]"
                @input="updateValue($event.target.value)">
            <option v-for="(option,idx) in options" :value="idx">
                {{option!=null && option.text != null ? option.text : option}}
            </option>
        </select>
    </div>
</template>

<script>
    module.exports = {
        name: "LabelSelect",
        components: {},
        props: {
            "value": Object,
            "options": Array,
            "label": String,
        },
        data() {
            return {}
        },

        methods: {
            updateValue(val) {
                let idx = Number(val)
                let option = this.options[idx]
                // console.log('select update', this.getOptionValue(option))
                this.$emit('input', this.getOptionValue(option))
            }
            ,
            getOptionValue(option) {
                return option.value != null ? option.value : option
            },
            getOptionText(option) {
                return option.text != null ? option.text : option
            }
        },

        computed: {},
        watch: {},

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
