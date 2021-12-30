<template>
        <div
                style="display: inline-block;height: fit-content"
                @dblclick="$refs.textarea.disabled=false;$refs.textarea.focus()"
                @focusout="$refs.textarea.disabled=true"
        >
              <textarea
                      rows="1"
                      style="width: 100%;height: 100%"
                      :placeholder="placeholder"
                      :disabled="disabled==null? true:disabled"
                      ref="textarea"
                      :value="value"
                      class="light-unmodifiable"
                      @input="input"
              ></textarea>
        </div>
</template>

<script>
    module.exports = {
        props: ["disabled", "placeholder", "value","autoAdjust"],
        components: {
        },
        name: "DoubleClickEditableTextarea",
        data() {
            return {
                loginApi: '/user/login'
            }
        },

        methods: {
            input(event) {
                this.$emit("input", event.target.value)
                if(this.autoAdjust === 'horizontal'){
                    // not currently supported, there is not scroll any way
                    // DocumentUtils.updateTextareaWidth(event.target)
                }else if(this.autoAdjust === 'vertical'){
                    DocumentUtils.updateTextareaHeight(event.target)
                }
            }
        }
    }
</script>

<style scoped>
    textarea.light-unmodifiable {
        overflow:hidden;
        outline: 0 solid transparent;
        border: 1px solid;
        font-family: Microsoft Yahei,serif;
        background-color: transparent;
        border-radius:2px;
        padding-left:4px;
    }

    textarea.light-unmodifiable:disabled {
        border: 0;
        background-color: rgba(196, 196, 196, 0.692);
    }
</style>
