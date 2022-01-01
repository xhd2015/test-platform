<script>
import Vue from "vue";
import {
  VSpacer,
  VBtn,
  VContainer,
  VRow,
  VCol,
  VSelect,
  VChip,
  VApp,
  VNavigationDrawer,
  VMain,
  VFooter,
  VAppBar,
  VList,
  VListItem,
  VListItemContent,
  VAppBarNavIcon,
  VCheckbox,
} from "vuetify/lib/components";

import { routes } from "./router";
import { Header, NavList, Footer } from "./view/main-frame";
import { Messages, Copy } from "./view";

import { message } from "./support";
import { injectCopyHandler, injectMessageHandler } from "./support/inject";
// import Messages from "./views/Messages";

// these two are global unhandled errors
window.onerror = function (msg, url, line, col, error) {
  //  console.log("on error:", error)
  message.showError(msg + "," + error?.message);
  //code to handle or report error goes here
};
// event:{reason:"message thrown"}
window.addEventListener("unhandledrejection", function (event) {
  const err = event.reason;
  if (err) {
    message.showError(err.message);
  }
  //handle error here
  //event.promise contains the promise object
  //event.reason contains the reason for the rejection
});

export default {
  created() {
    injectMessageHandler((message, options) => {
      this.$refs.messages.push(message, options);
    });
    injectCopyHandler((text, options) => {
      this.$refs.copy.showCopy(text, options);
    });
  },
  mounted() {},
  data() {
    return {
      drawer: false,
    };
  },
  render() {
    return (
      <VApp class="grey lighten-4">
        <Header />

        <Messages ref="messages" />
        <Copy ref="copy" />
        <VMain style={{ display: "flex" }} app>
          <VRow>
            <VCol cols="2">
              <VList>
                <VListItem>
                  <router-link to="/json">JSON Tool</router-link>
                </VListItem>
                <VListItem>
                  <router-link to="/log/parser">Log Parser</router-link>
                </VListItem>
                <VListItem>
                  <router-link to="/regex/matcher">Regex Matcher</router-link>
                </VListItem>
                <VListItem>
                  <router-link to="/string/conv">String Converter</router-link>
                </VListItem>
                <VListItem>
                  <router-link to="/grpc">GRPC</router-link>
                </VListItem>
              </VList>
            </VCol>
            <VCol cols="8" class="mt-2">
              <router-view></router-view>
            </VCol>

            <VCol cols="2">
              <VSpacer />
            </VCol>
          </VRow>
        </VMain>
        <Footer />
        {
          // <VAppBar app>
          //   <VAppBarNavIcon
          //     onClick={(e) => {
          //       e.stopPropagation();
          //       this.drawer = !this.drawer;
          //     }}
          //   ></VAppBarNavIcon>
          // </VAppBar>
        }
        {
          // <VNavigationDrawer
          //   app
          //   value={this.drawer}
          //   onInput={(shown) => (this.drawer = shown)}
          //   id="nav"
          // >
          //   {routes.map(
          //     (r, i) =>
          //       r.nav && (
          //         <VListItem>
          //           <VListItemContent class="primary darken-2 text-center">
          //             {
          //               // textDecoration: none  remove the underline
          //             }
          //             <router-link key={r.name} to={r.path}>
          //               <span class="white--text">{r.name}</span>
          //             </router-link>
          //           </VListItemContent>
          //         </VListItem>
          //       )
          //   )}
          // </VNavigationDrawer>
        }
        {
          // <Messages ref="messages" />
        }
        {
          // the VMain height is computed as static value
        }
        {
          // <VMain>
          //   <router-view></router-view>
          //   {
          //     // if parent container has height:100%,
          //     //  and child container has height: 100%,
          //     // typically the child will not have a full height, because percetage value
          //     // is effective only when parent value is deterministic
          //     // <VContainer fluid style={{minHeight:"100%"}} class="pa-0 ma-0">
          //     // </VContainer>
          //   }
          // </VMain>
        }
        {
          // <VFooter app>
          // </VFooter>
        }
      </VApp>
      // </VApp>
    );
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
