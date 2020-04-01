<template>
  <div :class="'ml-2 circle ' + status"></div>
</template>

<script>
export default {
  props: {
    status: String
  }
}
</script>

<style scoped>
  .circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: grey;
    display:inline-block;
  }
  .available {
    background: #63C3A7;
  }
  .booked {
    background: #115f83;
  }
  .taken {
    background: rgb(211, 8, 75);
  }
  .away {
    background: rgb(255, 209, 82);
  }
  .hogging {
    background: rgb(251, 129, 29);
  }
</style>