# Introduction
All code are written in ES6 syntax, using keywords like `export`,`import`,`import default`.

To make it available in `node`, we employ `babel.config-es2node.json` and corresponding `generate.js` to convert the code lib.

For other part that will only run in the browser, ES6 syntax is used and no converting needed.

To make vuetify+jsx work, one must have a `babel.config.js`:
```javascript
module.exports = {
    presets: [
      '@vue/cli-plugin-babel/preset'
    ]
}
```


# `package.json`
```json
{
   // ...
    "scripts": {
        "start": "electron .",
        "serve": "vue-cli-service serve --mode development",
        "build": "vue-cli-service build",
        "build-server": "VUE_CLI_SERVICE_CONFIG_PATH=vue.config-server.js vue-cli-service build",
        "generate": "node generate.js"
    }
    // ...
}
```

# `generate.js`(using babel converting es6 to nodejs)
```js
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
```

# `babel.config-es2node.json`
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

# Usage
```bash
npm run build
npm start
```

# Run modes
## Electron
```bash
npm run generate
npm run build
npm run start
```

## Browser
```bash
npm run generate
npm run build-server
# switch to the machine you want to deploy
./start-daemon.sh
```

## Develop(Browser)
```bash
npm run serve
```

# About this project
uses: vue-cli-service + vue2 + vue-rotuer + vuetify + babel + webpack + eslint

Overview:
```
                           [root]
                                   \
                                     \
                                    [UI Code]
                               public/index.html, index.js [entry]
                                 App.vue,router/index.js   [frame]
 package.json                       Home.vue               [main page]
   eslint
                                    view/**/*.Vue

                                  /              \
                          build /                 \ build
                               /                   \
                      vue.config.js           vue.config-server.js     main.js                
                          dist                    dist-server
                               [compile *.vue to js]
babel.config-es2node.json   
[compile util/*.js to util/lib/*.js, i.e. ES to NodeJS]
```

Create a tarball:
```bash
tar -czf electron-vue.tar.xz lukas/assets lukas/plugins lukas/public lukas/router lukas/view lukas/.gitignore lukas/App.vue lukas/babel.config.js lukas/index.js lukas/main.js lukas/package.json lukas/preload.js lukas/README.md lukas/vue.config.js
```

# Electron Tutorial
```bash
mkdir demo
cd demo
npm init

```

`package.json`:
```json
{
  "name": "demo",
  "version": "1.0.0",
  "description": "Hello World!",
  "main": "main.js", // electron looks for the 'main' entry to create main process
  "author": "Fulton Shaw",
  "license": "MIT",
  "scripts": {
    "start": "electron ."
  }
}
```

```bash
npm install --save-dev electron
```

# Vue tutorial
```bash
# latest stable
npm install vue@next
npm install -g @vue/cli
vue upgrade --next
```


Attach Vue APP to root instance:
```js
const RootComponent = {
  /* options */
}
const app = Vue.createApp(RootComponent) // app
const vm = app.mount('#app')  // root Vue compoenent
```

## Introducing `webpack` and  `vue-loader`


## Introducing `vue-cli-server`
```bash
npm install --save-dev @vue/cli-service
```

`package.json`
```json
{
  "scripts": {
    "serve": "vue-cli-service serve", // based on webpack-dev-server
    "build": "vue-cli-service build" // 
  }
}
```

`vue.config.js`, [doc](https://cli.vuejs.org/config/#vue-config-js)
```js
module.exports = {
    "transpileDependencies": [
      "vuetify"
    ],
    // publicPath: "/" // default
}
```


# ES6-to-Nodejs
see [util/README.md](util/README.md)