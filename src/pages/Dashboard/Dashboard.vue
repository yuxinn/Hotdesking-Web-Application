<template>
  <div class="Dashboard">
    {{tables}}
    <template>
      <a-input v-model="tableid" class="mb-2" placeholder="Table ID" /><br>
    </template>
    <a-button @click="createTable" type="primary">Add Table</a-button>
  </div>
</template>

<script>
import { getTables, createTable } from "../../api"

export default {
  components: {

  },
  data() {
    return {
        tables: [],
        tableid: "",
        status: "available"
    }
  },
  mounted(){
    this.getTables()
  },
  methods: {
    async getTables() {
      var resp = await getTables()
      this.tables = resp
      console.log(resp)
    },
    async createTable() {
      var data = { tableid: this.tableid, status: this.status }
      var resp = await createTable(data)
      console.log(resp)
    }
  },
  computed: {

  }
}
</script>