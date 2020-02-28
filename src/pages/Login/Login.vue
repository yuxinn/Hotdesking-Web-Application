<template>
  <div class="background-image">
    <div class="login-container">
      <img src="../../assets/logo.png" alt="" height="50%"/>
      <!-- <a :href="login_url"> -->
        <img src="../../assets/GoogleButton.png" @click="login" class="loginbtn mx-auto d-block" width="200px" />
      <!-- </a> -->
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      login_url: "http://google.com",
      notification: this.$route.params.notification
    };
  },
  computed: {},
  methods: {
    login() {
      this.$router.push('/dashboard')
    }
  },
  mounted() {
  }
};
</script>

<style>
.loginbtn:hover {
  cursor: pointer;
}
.background-image {
  background: url("../../assets/login-bg.png");
  position: absolute;
  background-size: cover;
  height: 100%;
  width: 100%;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 0;
}
.login-container {
  text-align: center;
  margin: auto;
  width: 300px;
  height: 286px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.5);
  top: 20%;
  position: relative;
  -webkit-border-radius: 4px;
  -moz-border-radius: 4px;
  border-radius: 4px;
  color: white;
}
</style>
