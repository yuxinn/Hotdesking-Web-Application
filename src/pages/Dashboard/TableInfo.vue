<template>
  <div class="TableInfo">
    <a-modal title="Table Details" v-model="visible" @cancel="handleClose" @ok="handleBook">
      <template slot="footer">
        <a-button key="back" @click="handleClose">Close</a-button>
        <a-button v-if="status==='available'" key="submit" type="primary" @click="handleBook">
          Book
        </a-button>
      </template>
      
      <a-row :gutter="16">
        <a-col class="gutter-row" :span="8">
          <img src="../../assets/desk.png" alt="Table" class="center mb-1">
          <p class="h6 text-center">
            {{tableId.toUpperCase()}}
          </p> 
          <div class="status d-flex justify-content-center">
            <strong>{{status.replace(/^\w/, c => c.toUpperCase())}}</strong>
            <div :class="'ml-2 circle ' + status"></div>
          </div>
        </a-col>
        <a-col class="gutter-row" :span="16">
          <a-row :gutter="16">
            <p class="h6 pl-2">Sensor Health</p>
          </a-row>
          <a-row :gutter="16">
            <a-col class="gutter-row" :span="10">
              <p class="floating">Motion Sensor 1:</p> 
            </a-col>
            <a-col class="gutter-row" :span="14">
              <p class="floating">Time</p> 
            </a-col>
            <a-col class="gutter-row" :span="10">
              <p class="floating">Motion Sensor 2:</p> 
            </a-col>
            <a-col class="gutter-row" :span="14">
              <p class="floating">Time</p> 
            </a-col>
          </a-row>
        </a-col>
        
      </a-row>
    </a-modal>
  </div>
</template>

<script>
export default {
  props: {
    showTableInfo: Boolean,
    table: Object,
    bookTable: Function,
  },
  data() {
    return {
      visible: this.showTableInfo
    }
  },
  methods: {
    handleBook() {
      this.$confirm({
        title: 'Reserve Table ' + this.tableId.toUpperCase() + '?',
        content: 'Table will be reserved for an hour.',
        okText: 'Book',
        okType: 'danger',
        cancelText: 'No',
        onOk: async ()=> {
          try {
            await this.bookTable(this.cluster, this.tableId)
            this.table.status = 'booked'
          } catch(err) {
            console.error(err)
          }

        }
      })
    },
    handleClose() {
      this.$emit('close')
    },
  },
  computed: {
    cluster() {
      return this.table.cluster
    },
    tableId() {
      return this.table.tableId
    },
    status() {
      return this.table.status
    }
  }
}
</script>

<style scoped>
  .circle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: red;
    display:inline-block;
  }
  .available {
    background: #63C3A7;
  }
  .booked {
    background: rgb(118, 194, 230);
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
  .floating strong {
    display: table-cell; 
    vertical-align: middle; 
    text-align: center;
    display: inline;
  }
  .center {
    display: block;
    margin-left: auto;
    margin-right: auto;
    width: 40%;
}

</style>