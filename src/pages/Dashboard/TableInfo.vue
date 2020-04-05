<template>
  <div class="TableInfo">
    <a-modal title="Table Details" v-model="visible" @cancel="handleClose" @ok="handleBook">
      <template slot="footer">
        <a-button key="back" @click="handleClose">Close</a-button>
        <a-button :key="currentStatus" v-if="currentStatus==='available'" type="primary" @click="handleBook">
          Book
        </a-button>
      </template>
      
      <a-row :gutter="16">
        <a-col class="gutter-row mt-3" :span="8">
          <img src="../../assets/desk.png" alt="Table" class="center mb-1">
          <div class="d-flex justify-content-center mt-2">
            <p class="h6 text-center d-inline" style="vertical-align: 3px">
              {{tableId.toUpperCase()}}
            </p>
            <Status :key="currentStatus" :status="currentStatus"></Status>
            <!-- <div :class="'ml-2 circle ' + status"></div> -->
          </div>
        </a-col>
        <a-col class="gutter-row" :span="16">
          <a-row :gutter="16">
            <p class="h6 pl-2">Sensor Health</p>
          </a-row>
          <a-row v-for="sensor in sensors" :key="sensor.sensorId" :gutter="16">
            <a-col class="gutter-row" :span="7">
              <p class="floating">{{sensor.name}}:</p> 
            </a-col>
            <a-col class="gutter-row" :span="15">
              <div class="circle available"></div> 
              <small class="ml-1" style="vertical-align: 3px"> Last update 0 mins ago</small>
              <!-- <div :class="sensor.lastUpdate>120?'circle na':'circle available'"></div> 
              <small class="ml-1" style="vertical-align: 3px"> Last update {{sensor.lastUpdate}} mins ago</small> -->
            </a-col>
          </a-row>
        </a-col>
        
      </a-row>
    </a-modal>
  </div>
</template>

<script>
import Status from '../../components/Status'

export default {
  props: {
    showTableInfo: Boolean,
    table: Object,
    allSensors: Object,
    bookTable: Function,
  },
  components: {
    Status
  },
  data() {
    return {
      visible: this.showTableInfo,
      currentStatus: this.table.status
    }
  },
  computed: {
    sensors() {
      return this.allSensors[this.tableId] || []
    },
    cluster() {
      return this.table.cluster
    },
    tableId() {
      return this.table.tableId
    },
    status() {
      return this.table.status
    }
  },
  watch: {
    table(val) {
      this.currentStatus = val.status
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
            this.currentStatus = 'booked'
          } catch(err) {
            console.error(err)
          }

        }
      })
    },
    handleClose() {
      this.$emit('close')
    }
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
    width: 80%;
    margin-bottom: 10px;
}

</style>