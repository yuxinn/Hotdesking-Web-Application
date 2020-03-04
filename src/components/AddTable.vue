<template>
  <div class="AddTable">
    <a-modal title="Add Table" v-model="visible" @cancel="handleClose" @ok="handleOk" okText="Add">
      <a-form>
        <a-form-item label="Cluster" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-input v-model="cluster" placeholder="Cluster" />
        </a-form-item>
        <a-form-item label="Seat Number" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-input v-model="table" placeholder="Seat Number" />
        </a-form-item>
        <a-form-item label="Status" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-select v-model="status">
            <a-select-option v-for="status in statuses" :key="status">
              {{status}}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
  export default {
    props: ["visibleModal"],
    data() {
      return {
        visible: this.visibleModal,  
        cluster: "",
        table: "",
        status: "available",
        statuses: ["available", "booked"]
      };
    },
    methods: {
      handleOk() {
        var data = {
          "tableId": this.tableid,
          "status": this.status 
        }
        this.$emit('submit', data)
      },
      handleClose() {
        this.$emit('close')
      },
    },
    computed: {
      tableid() {
        return this.cluster + "-" + this.table  
      }
    }
  };
</script>