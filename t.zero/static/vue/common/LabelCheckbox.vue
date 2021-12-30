<template>
    <div style="display: inline" ref="boxParent" @click="changeValueFromParent">
        <input ref="box" type="checkbox" @input="changeFromInput" :checked="internalValue"/><label
            v-if="label">{{label}}</label>
    </div>
</template>

<script>
    module.exports = {
        name: "LabelCheckbox",
        components: {},
        props: {
            "value": Boolean,
            "label": String
        },
        data() {
            return {}
        },

        methods: {
            changeValueFromParent($event) {
                if ($event.target === this.$refs.box) {
                    return;
                }
                this.$refs.box.checked = !this.$refs.box.checked;
                this.changeFromInput()
            },
            changeFromInput() {
                // this.$refs.box.checked = !this.$refs.box.checked;
                this.$emit('input', this.$refs.box.checked)
            }
        },

        computed: {
            internalValue() {
                return StringUtils.toType(this.value, Boolean)
            }
        },
        watch: {},

        created: function () {

            // console.log("created")
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
