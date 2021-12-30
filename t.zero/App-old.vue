<!-- 
<template>
  <v-app>
    <div id="nav">
      <router-link to="/" v-for="r in " :key="">Home</router-link> |
      <router-link to="/about">About</router-link> |
      <router-link to="/buttons">Buttons</router-link> |
      <router-link to="/grid">Grid</router-link> |
      <router-link to="/jsx">JSX</router-link>
    </div>
    <router-view />
  </v-app>
</template>
-->

<script>
import Vue from "vue";
import {
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
  VListItem,
  VListItemContent,
  VAppBarNavIcon,
} from "vuetify/lib/components";
import { routes } from "./router";
// import Messages from "./views/Messages";

export default {
  mounted() {},
  data() {
    return {
      drawer: false,
    };
  },
  render() {
    return (
      <VApp class="grey lighten-4">
        <VAppBar app>
          <VAppBarNavIcon
            onClick={(e) => {
              e.stopPropagation();
              this.drawer = !this.drawer;
            }}
          ></VAppBarNavIcon>
        </VAppBar>
        <VNavigationDrawer
          app
          value={this.drawer}
          onInput={(shown) => (this.drawer = shown)}
          id="nav"
        >
          {routes.map(
            (r, i) =>
              r.nav && (
                <VListItem>
                  <VListItemContent class="primary darken-2 text-center">
                    {
                      // textDecoration: none  remove the underline
                    }
                    <router-link key={r.name} to={r.path}>
                      <span class="white--text">{r.name}</span>
                    </router-link>
                  </VListItemContent>
                </VListItem>
              )
          )}
        </VNavigationDrawer>
        <Messages ref="messages" />
        {
          // the VMain height is computed as static value
        }
        <VMain>
          <router-view></router-view>
          {
            // if parent container has height:100%,
            //  and child container has height: 100%,
            // typically the child will not have a full height, because percetage value
            // is effective only when parent value is deterministic
            // <VContainer fluid style={{minHeight:"100%"}} class="pa-0 ma-0">
            // </VContainer>
          }
        </VMain>
        <VFooter app></VFooter>
      </VApp>
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
