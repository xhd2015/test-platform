# About
`t.zero`: test platform **zero**

It has the following aliases:
`t.0`,`x.d`

# Online access
TODO

# Local deploy
```bash
npm run generate
npm run build
npm run start
```


# nginx based server
```bash
cp 
```

# scripts
## `serve`
Build all vue code and link it to html, serve the html at http://localhost:3003.

Any modification is observed and causes a rebuild and serve new generated file, without restarting the server.

## `build`
Build all vue code to directory `dist`, which can be configured as static assets of a nginx server, for static access.

Note, prior to `npm run build`, should you do `npm run generate` first.

## `generate`

If encountered with error related to "'fs/promises'not found ",try upgrade your node js, verify that: 
```bash
$ node --version
v16.13.1
```

# NOTE
created by `vue create project`:
```bash
├── babel.config.js
├── public
│   ├── favicon.ico
│   └── index.html
└── src
    ├── App.vue
    ├── assets
    ├── components
    └── main.js
```

`src/main.js`:
```js
import Vue from 'vue'
import App from './App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
```

then `vue add vuetify`:
`vue.config.js`
```js
module.exports = {
  transpileDependencies: [
    'vuetify'
  ]
}
```

`public/index.html`:
```html
...
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@mdi/font@latest/css/materialdesignicons.min.css">
```

If some icons not loading, use `<link rel="stylesheet" media="screen" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700\|Material+Icons"/>`


# Env
must starts with `VUE_APP_`, can be accessed through `porcess.env.VUE_APP_*`