<template>
    <div ref="container" style="width:800px;height:600px;border:1px solid grey"></div>
</template>

<script>
    console.log('loading SqlMonacoEditor')
    let sqlKeyWords = ['SELECT * FROM', 'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'LIMIT', 'JOIN', 'ON','AND','OR','IF','END','CASE','WHEN']
    // let columnMap = {
    //     't_a': {
    //         'id': {
    //             label: "id -- primary id"
    //         }
    //     },
    //     't_b': {
    //         'id': {
    //             label: "id -- primary id"
    //         },
    //         "name": {
    //             label: "name -- the name"
    //         }
    //
    //     }
    // }
    module.exports = {
        name: "MonacoEditor",
        props: {
            // providing(textModel,position,previousWord,segment)
            tables: Array, // tables
            columnMap: Object
        },
        data() {
            return {
                editor: null,
                tableCommand: null
            }
        },

        computed:{
            commonWords(){

            }
        },

        methods: {
            getValue() {
                return this.editor.getValue()
            },
            onRequestingTable(table) {
                this.$emit('require-table', table)
            },
            addAction() {
                let _this = this
                this.tableCommand = this.editor.addCommand(null, function (e, table) {
                    _this.onRequestingTable(table)
                })
            }
        },
        mounted() {
            this.editor = monaco.editor.create(this.$refs.container, {
                value: "",
                language: 'sql'
            });
            this.addAction()
            let _this = this
            // CompletionItemProvider
            monaco.languages.registerCompletionItemProvider('sql', {
                triggerCharacters: ['abcdefghijklmnopzrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', ' .'].join(""),
                // provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext, token: CancellationToken): ProviderResult<CompletionList>
                provideCompletionItems(textModel, position, completionContext, cancellationToken) {
                    let tables = _this.tables || []
                    let columnMap = _this.columnMap
                    let suggestions = []
                    let triggerType = 'normal'
                    let dashTable = ''
                    let columnPrefix = ''
                    let range = null
                    let tablePrefix = ""

                    if (completionContext.triggerCharacter === ".") {
                        // X.
                        dashTable = textModel.getWordAtPosition(position.delta(0, -1))
                        if (dashTable) {
                            triggerType = 'dash'
                            range = new monaco.Range(position.lineNumber, position.column + 1, position.lineNumber, position.column + 1)
                        }
                    } else if (completionContext.triggerCharacter === " ") {
                        triggerType = 'space'
                        let lastWord = textModel.getWordAtPosition(position.delta(0, -1))
                        let lastwordUp = lastWord ? lastWord.word.toUpperCase() : ""
                        let range = new monaco.Range(position.lineNumber, position.column + 1, position.lineNumber, position.column + 1)
                        if (lastwordUp === 'FROM') {
                            triggerType = 'from'
                        } else if (lastwordUp === 'WHERE') {
                            triggerType = 'dash'
                        } else {
                            // triggerType = 'dash' // column
                        }
                    } else {
                        let word = textModel.getWordAtPosition(position)
                        let lastPosition = word == null ? null : new monaco.Position(position.lineNumber, word.startColumn - 1)
                        let lastWord = lastPosition == null ? null : textModel.getWordAtPosition(lastPosition)
                        // getWordAtPosition ignores '.', 'X.Y' at '.' returns X,so we need to check the '.'
                        if (lastWord != null && textModel.getValueInRange(new monaco.Range(position.lineNumber, lastWord.endColumn, position.lineNumber, word.startColumn)) === ".") {
                            // X.Y
                            triggerType = 'dash'
                            dashTable = lastWord.word
                            columnPrefix = word.word
                            range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                        } else if (lastWord != null && lastWord.word.toUpperCase() === 'FROM') {
                            // FROM X
                            triggerType = 'from'
                            tablePrefix = word.word
                            range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                        } else if (lastWord != null && lastWord.word.toUpperCase() === 'WHERE') {
                            // WHERE Y
                            triggerType = 'dash'
                            columnPrefix = word.word
                            range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                        } else {
                            // ANYTHING
                            // triggerType = 'dash'
                            // columnPrefix = word.word
                            // range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn)
                        }
                    }

                    if (triggerType === 'dash') {
                        let candidates = []
                        if (dashTable in columnMap) {
                            candidates.push(columnMap[dashTable])
                        } else {
                            for (let k in columnMap) {
                                if (k != null) {
                                    candidates.push(columnMap[k])
                                }
                            }
                        }
                        let upPrefix = columnPrefix.toUpperCase()
                        let visited = new Set()
                        for (let mp of candidates) {
                            for (let col in mp) {
                                if (col != null && !visited.has(col) && col.toUpperCase().startsWith(upPrefix)) {
                                    visited.add(col)
                                    suggestions.push({
                                        label: mp[col].label || col,
                                        kind: 3, // field
                                        insertText: col + " ",
                                        range: range
                                    })
                                }
                            }
                        }
                    } else if (triggerType === "from") {
                        let uptable = tablePrefix.toUpperCase();
                        for (let mp of tables) {
                            if (mp.toUpperCase().startsWith(uptable)) {
                                suggestions.push({
                                    label: mp,
                                    kind: 3, // field
                                    insertText: mp + " ",
                                    range: range,
                                    command: {
                                        id: _this.tableCommand,
                                        arguments: [mp]
                                    }
                                })
                            }
                        }
                    } else if (triggerType === "normal") {
                        let word = textModel.getWordAtPosition(position)
                        if (word != null) {
                            let range = word.word ? new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn) :
                                new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column)
                            let upword = word.word ? word.word.toUpperCase() : ""
                            // first check the keyword list
                            for (let w of sqlKeyWords) {
                                if (w.startsWith(upword)) {
                                    suggestions.push({
                                        label: w,
                                        kind: 17,
                                        insertText: w + " ",
                                        range: range
                                    })
                                }
                            }
                        }
                    }
                    return {
                        suggestions
                    }
                }
            })
        }
    }
</script>

<style scoped>
    /*@import "../../monaco-editor/node_modules/monaco-editor/dev/vs/editor/editor.main.css";*/
</style>
