<template>
    <textarea ref="textarea" :class='{"message-box":true}' disabled="true" :placeholder="placeholder"></textarea>
</template>

<script>
    module.exports = {
        name: "AdaptiveTextArea",
        components: {},
        props: ["value","placeholder"],
        data() {
            return {}
        },

        methods: {
            updateArea() {
                let area = this.$refs.textarea
                area.value = this.value
                DocumentUtils.updateTextareaHeight(area)
            }
        }
        ,
        computed: {}
        ,
        watch: {
            value() {
                this.debouncedUpdateArea()
            }
        }
        ,

        created: function () {
            this.debouncedUpdateArea = _.debounce(this.updateArea, 200)
            // this.debouncedUpdateUsingEvaluation = _.debounce(this.updateUsingEvaluation, 400)
            // console.log("created")
        }
        ,
        updated() {
            // console.log("updated")
        }
        ,
        mounted() {
        }
    }
</script>

<style scoped>
    textarea.message-box {
        display: block;
        height: auto;
        overflow: auto;
        margin: 0;
        font-family: Courier New, sans-serif;
        border: none;
        box-shadow: none;
        padding: 6px 12px;
        border-radius: 4px;
    }
</style>
