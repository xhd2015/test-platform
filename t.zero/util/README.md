# Usage
All scripts are written in ES syntax, for usage of Nodejs, see the following section.

# TODO
Move this directory to [fultonjs](https://github.com/xhd2015/fultonjs).

# Compile to `node.js`
```bash
npm i -D @babel/cli
```
`package.json` the `generate` command
```json
{
 "scripts": {
    "generate": "./node_modules/@babel/cli/bin/babel.js --config-file ./babel.config-es2node.json  --out-dir lib src"
 }
}
```

`babel.config.json`
```json
{
    "presets": [
        [
            "@babel/preset-env",
            {
                "targets": {
                    "node": true
                }
            }
        ]
    ]
}
```