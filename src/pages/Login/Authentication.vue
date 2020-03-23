<template>
  <div class="authentication"></div>
</template>

<script>
import { verifyToken } from "../../api";

export default {
  methods: {
    async authorization(token) {
      try {
        await verifyToken(token);
        this.$http.defaults.headers.common['X-NTUCBee-Token'] = token;
        this.$router.push('/dashboard');
      } catch(err) {
        console.error(err)
        this.$message.error('Unauthorized Access.')
      }
    }
  },
  mounted() {
    if (this.$route.query.token) {
      this.authorization(this.$route.query.token)
    } else {
      this.$router.push('/login')
    }
  }

}
</script>