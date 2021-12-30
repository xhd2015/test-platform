<template>
    <div style="display: inline">
        <label v-if="label">{{label}}</label>
        <div style="display: inline-flex;border: 1px solid;width: fit-content" v-if="options">
        <span v-for="(option,idx) in options" :key="idx" :ref="'item'+idx"
              :class="{'toggle-selected':currentValue === getOptionValue(option),'toggle-item':true, 'toggle-item-non-last':idx<options.length-1}"
              @click="onToggle(idx)">
            {{getOptionText(option)}}
        </span>
        </div>
    </div>
</template>

<script>
   export default  {
        name: "Toggle",
        components: {},
        props: ["value", "options", "label"],
        data() {
            return {
                maxWidth: null
            }
        },

        methods: {
            onToggle(idx) {
                let option = this.options[idx]
                let value = this.getOptionValue(option)
                if (this.value !== value) {
                    this.value = value;
                    this.$emit('input', value)
                }
            },
            getOptionValue(option) {
                return option.value != null ? option.value : option
            },
            getOptionText(option) {
                return option.text != null ? option.text : option
            }
        },

        computed: {
            currentValue() {
                return this.value == null ? (this.options == null || this.options.length === 0 ? null : this.getOptionValue(this.options[0])) : this.value
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
            console.log("toggle mounted")
            if (this.options && this.maxWidth == null) {
                // console.log("before,maxWidth=", this.maxWidth)
                let n = this.options.length
                // console.log("n=", n)
                let width = null
                for (let i = 0; i < n; i++) {
                    // console.log("updateing", i)
                    let item = this.$refs["item" + i][0] // v-for makes it an array
                    if (item != null && width == null || width < item.offsetWidth) {
                        width = item.offsetWidth
                    }
                }
                // if (width == null) {
                //     return
                // }
                this.maxWidth = width
                // console.log("maxWidth=", this.maxWidth)
                for (let i = 0; i < n; i++) {
                    let item = this.$refs["item" + i][0]
                    if (item != null) {
                        // let item = document.getElementById("item" + i)
                        item.style.width = this.maxWidth + 'px'
                    }
                }
            }
        }
    }
</script>

<style scoped>
    .toggle-item {
        padding-right: 5px;
        padding-left: 5px;
        text-align: center;
        /*do not break line when containing space*/
        white-space: nowrap;
    }

    .toggle-selected {
        border-radius: 1px;
        /*border: 1px solid;*/
        background-color: lightblue;
    }

    .toggle-item-non-last {
        border-right: 1px solid;
    }

</style>
