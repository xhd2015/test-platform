<template>
    <textarea class="json-editor" :value="text" ref="area"
              @input="updateText($event.target.value)"></textarea>
</template>

<script>
    module.exports = {
        name: "JsonEditor",
        components: {},
        props: ["value"],
        data() {
            return {
                text: ""
            }
        },

        created() {
            this.text = JSON.stringify(this.value, null, "    ")
        },

        methods: {
            updateText(val) {
                this.$refs.area.value = val
                this.text = val
                DocumentUtils.updateTextareaHeight(this.$refs.area)
                this.debouncedEmitInput()
            },
            emitInput() {
                try {
                    let obj = JSON.parse(this.text)
                    this.$emit('input', obj)
                } catch (e) {

                }
            }
        },
        computed: {},
        watch: {},
        updated() {
            // console.log("updated")
        },
        mounted() {
            this.debouncedEmitInput = _.debounce(this.emitInput, 200)
            this.updateText(this.text)
        }
    }
</script>

<style scoped>
    textarea.json-editor {
        width: 100%;
        display: block;
        height: auto;
        overflow: auto;
        margin: 0;
        font-family: Courier New, sans-serif;
        border: none;
        box-shadow: none;
        background-color: #f0f0f0;
        padding: 6px 12px;
        border-radius: 4px;
    }

    textarea.message-box.error {
        color: #900;
        background-color: #fee;
    }
</style>
