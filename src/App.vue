<template>
  <div id="app">
    <Sidebar v-if="currentRouteName!='login'"></Sidebar>
    <router-view v-else></router-view>
  </div>
</template>

<script>
import Sidebar from './pages/Sidebar'

export default {
  name: 'app',
  components: {
    Sidebar
  },
  data() {
    return {
      collapsed: false,
    };
  },
  computed: {
    currentRouteName() {
      return this.$route.name.toLowerCase() || '';
    }
  }
}
</script>

<style>
  #components-layout-demo-side .logo {
    /* height: 100px; */
    /* background: rgba(104, 119, 158, 0.733); */
    margin: 16px;
  }
  .logo-img {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 100%;
    height: auto;
  }
</style>
