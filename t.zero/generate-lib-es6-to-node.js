const fs = require("fs/promises")
const child_process = require("child_process")
const path = require("path")

child_process.execSync("./node_modules/@babel/cli/bin/babel.js --config-file ./babel.config-es2node.json  --out-dir util/lib --ignore util/lib util");

// do some fixings
(async () => {
    const dir = path.join(__dirname, "util/lib")
    const names = await fs.readdir(dir)
    const actions = names.map(async name => {
        const file = path.join(dir, name)
        const content = await fs.readFile(file, { encoding: 'utf-8' })
        // replace @fultonjs/common/src
        // with     @fultonjs/common/lib
        const newContent = content.replace(/require\((['"])@fultonjs\/common\/src/g, "require($1@fultonjs/common/lib")
        if (newContent !== content) {
            await fs.writeFile(file, newContent)
        }
    })
    await Promise.all(actions)
})()