<template>
    <div>
        <h1>Monaco Editor Sync Loading Sample</h1>
        <div ref="container" style="width:800px;height:600px;border:1px solid grey"></div>
    </div>

</template>

<script>
    module.exports = {
        name: "MonacoEditor",
        props: {},
        data() {
            return {
                editor: null
            }
        },

        methods: {},
        mounted() {
            this.editor = monaco.editor.create(this.$refs.container, {
                value: [
                    'function x() {',
                    '\tconsole.log("Hello world!");',
                    '}'
                ].join('\n'),
                language: 'javascript'
            });
        }
    }
</script>

<style scoped>
    /*@import "../../monaco-editor/node_modules/monaco-editor/dev/vs/editor/editor.main.css";*/
</style>
