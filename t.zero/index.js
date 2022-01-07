import Vue from 'vue'
import App from './App.vue'
// import { BootstrapVue, IconsPlugin } from 'bootstrap-vue'
// import 'bootstrap/dist/css/bootstrap.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
import vuetify from './plugins/vuetify';

// use router
import router from './router'

import { PerfV1_2, IDGen } from "./util/storage-perf"
import { Header, Footer } from "./view/main-frame"

if (typeof window.idgen === 'undefined') {
  window.idgen = new IDGen(localStorage)
}

// render-side perf
if (typeof window.perf === 'undefined') {
  // const cfgStore = localStorage.getItem("config")
  // const config = cfgStore ? JSON.parse(cfgStore) : {}

  // // this implementation is not safe, multiple instance 
  // window.perf = {
  //   get config() {
  //     return config
  //   },
  //   get(k) {
  //     return config[k]
  //   },
  //   set(k, v) {
  //     config[k] = v
  //     // may be debounced save
  //     localStorage.setItem("config", JSON.stringify(config))
  //   }
  // }

  // all starts with prefix 
  // the prefix: config.[cfgVersion] is used to avoid duplicate
  // config.[cfgVersion].name



  window.perf = new PerfV1_2()

  // dead code
  //   const cfgVersion = localStorage.getItem("configVersion")
  //   if (cfgVersion === '1.0' || cfgVersion === '' || cfgVersion == null) {
  //     // 1.0 or empty
  //     // upgrade
  //     const cfgValuev1_0 = localStorage.getItem("config")
  //     const configv1_0 = cfgValuev1_0 ? JSON.parse(cfgValuev1_0) : {}

  //     const { clipboardItems, todoListItems } = configv1_0 || {}
  //     for (let item of clipboardItems) {
  //       const id = window.idgen.get()
  //       item.id = id
  //       window.perf.set("clipboardItems", id, item)
  //     }
  //     for (let item of todoListItems) {
  //       const id = window.idgen.get()
  //       item.id = id
  //       window.perf.set("todoListItems", id, item)
  //     }
  //     localStorage.setItem("configVersion", "1.2")
  //   } else if (cfgVersion === '1.1') {
  //     // nothing to upgrade
  //     localStorage.setItem("configVersion", "1.2")
  //   } else if (cfgVersion !== '1.2') {
  //     // cannot handler other config version
  //     console.warn("config version not supported:", cfgVersion, ", supported list:[1.0,1.1]")
  //   }
}


const perf = window.perf


console.log("perf:", window.perf)
// import { keyValueRemap } from 'lib-fulton-vue-common/utils'
// import * as VuetifyDirectives from 'vuetify/lib/directives'
// import { kebabCase } from "voca"
// import longclick from "./directives/longclick"
// import Api from "./api"
// import { methods } from "lib-fulton-vue-common/utils"
// import click from './directives/click';
// import { HttpApi } from 'lib-fulton-vue-common/api';

// let uriPrefix = ""

// function onError(ctx, err) {
//   const handler = function (err) {
//     console.log("api error:", err)
//   }
//   if (ctx.handler && ctx.handler.onError) {
//     return ctx.handler.onError(err, handler)
//   } else {
//     return handler(err)
//   }
// }

// the global App vue instance
let app
let state = {
  user: undefined,
  perf // perference
}
// let httpApi = new HttpApi({ onError, uriPrefix, preset: { user_id: 1 } })
// let apiRaw = new Api(httpApi)
// let apiMethods = methods(apiRaw, false)

Vue.config.productionTip = false

// inject all directives so that  JSX 
// can use v-ripple 
Vue.mixin({
  data() {
    return {
      state
    }
  },
  computed: {
    api() {
      let api = {}
      //   for (let methodName in apiMethods) {
      //     let method = apiMethods[methodName]
      //     api[methodName] = async (param, options) => await method.call(apiRaw, {
      //       handler: this, ...options, onError
      //     }, param)
      //   }
      return api
    },
    user() {
      return this.state.user
    },
    perf() {
      return this.state.perf
    },
    idgen() {
      return window.idgen
    }
  },
  methods: {
    showMessage(message) {
      if (message) {
        app.$refs.messages.add(message)
      }
    },
    showError(err) {
      if (err) {
        this.showMessage({
          type: "error",
          loading: false,
          close: true,
          message: err.message || err.toString()
        })
      }
    }
  },
  directives: {

  }
})

// globally available
let rootVue = new Vue({
  vuetify,
  router,
  mounted() {
    console.log("App mounted")
    console.log("App route:", this.$route)
    app = this.$children[0]
  },
  // watch route change
  watch: {
    '$route': {
      deep: true,
      immediate: true, // skip initial route setup
      handler(v) { // v:{fullPathl,hash, path,params,query}
        console.log("route changed:", v)
        // perf.set('fullPath', v.fullPath)
        if (v.name) {
          document.title = `${v.name} - Test Platform`
        }
      }
    }
  },
  render: h => h(App)
})
rootVue.$mount('#app')

// header
// new Vue({
//   el:"#header",
//   render: h=>h(Header)
// })
// footer
// new Vue({
//   el:"#footer",
//   render: h=>h(Footer)
// })

console.log("App mounted");

// set initial route based on config
(async () => {
  const perfFullPath = await perf.get("fullPath")
  if (perfFullPath && perfFullPath !== rootVue.$route.fullPath) {
    console.log("perfFullPath set:", perfFullPath, rootVue.$route.fullPath)
    rootVue.$router.replace(perfFullPath)
  }
})()

// this.$router API:
// router.push(location, onComplete?, onAbort?)
// router.push(location).then(onComplete).catch(onAbort)
// router.replace(location, onComplete?, onAbort?)
// router.replace(location).then(onComplete).catch(onAbort)
// router.go(n)
// router.back()
// router.forward()