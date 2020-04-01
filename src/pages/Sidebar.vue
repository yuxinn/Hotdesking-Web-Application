<template>
  <a-layout id="components-layout-demo-side" style="min-height: 100vh">
  <a-layout-sider collapsible v-model="collapsed">
    <div class="logo"> 
      <img v-if="collapsed" src="../assets/bee.png" class="logo-img" />
      <img v-else src="../assets/logo.png" class="logo-img" />
    </div>
    <a-menu @click="handleClick" theme="dark" :defaultSelectedKeys="['dashboard']" mode="inline">
      <a-menu-item key="dashboard">
        <a-icon class="sidebar-icon" type="desktop" />
        <span>Dashboard</span>
      </a-menu-item>

      <a-menu-item key="user">
        <a-icon class="sidebar-icon" type="user" />
        <span>User Management</span>
      </a-menu-item>
      
      <a-menu-item key="login" class="mt-5">
        <a-icon class="sidebar-icon" type="poweroff" />
        <span>Log Out</span>
      </a-menu-item>
    </a-menu>
  </a-layout-sider>
  <a-layout>
    <a-layout-content style="margin: 0 16px">
      <div :style="{ padding: '24px', background: '#fff', minHeight: '90vh', marginTop: '15px' }">
        <router-view></router-view>
      </div>
    </a-layout-content>
    <a-layout-footer style="text-align: center">
      I-oT? ©2020
    </a-layout-footer>
  </a-layout>
</a-layout>
</template>

<script>
import { mapActions } from 'vuex'
  export default {
    data() {
      return {
        collapsed: false,
        selected: '',
      };
    },
    methods: {
      ...mapActions('beeuser', ['logout']),
      handleClick(e) {
        this.selected = e.key
        if (e.key == 'login') this.logout()
        this.$router.push('/' + this.selected)
      }
    },
  };
</script>

<style scoped>
  .sidebar-icon {
    vertical-align: 1px;
  }
</style>