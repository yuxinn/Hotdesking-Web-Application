<template>
  <div class="Dashboard mb-4">
    <div class="d-flex justify-content-between mb-3">
      <p class="h4 mb-3">Hot Desk Summary</p>
      <a-spin v-if="fetching" size="small" />
      <a-tag v-else class="mr-0 pl-0" style="cursor: default;">
        <a-icon type="check-circle" style="vertical-align: 1px;" class="mx-2"/>
        Last Updated: {{time.format("MMMM Do YYYY, HH:mm:ss")}}
      </a-tag>
    </div>

    <div class="d-flex justify-content-between mb-3" >
      <a-button type="default" @click="showModal">
        <a-icon type="plus-circle" style="vertical-align: 1px;"/>
        Add Table
      </a-button>
      <div>
        <a-tag class="available legend">Available</a-tag>
        <a-tag class="booked legend">Booked</a-tag>
        <a-tag class="taken legend">Taken</a-tag>
        <a-tag class="away legend">Away</a-tag>
        <a-tag class="hogging legend  mr-0">Hogging</a-tag>
      </div>
    </div>

    <AddTable v-if="visibleModal" :visibleModal="visibleModal" @close="closeModal" @submit="submitNew"></AddTable>
    
    <a-row :gutter="16">
      <a-col class="gutter-row" :span="6">
        <div class="gutter-box"><Occupancy v-if="tables" :tables="tables"></Occupancy></div>
      </a-col>
      <a-col class="gutter-row" :span="18">
        <div class="gutter-box" style="background-color: #ececec; padding: 20px;">
          <a-list itemLayout="horizontal" :dataSource="clusters" :loading="firstload">
            <a-list-item slot="renderItem" slot-scope="cluster">
              <a-list-item-meta>
                <div slot="title">{{cluster.toUpperCase()}}</div>
                <div slot="description">
                  {{clusterStatus(tables[cluster])}}
                </div>
              </a-list-item-meta>
              <div class="content">
                <div class="tables row">
                  <div class="col-auto mr-3" v-for="{tableId, status} in tables[cluster]" :key="tableId">
                    <div class="row d-flex justify-content-center">
                        <a-tooltip placement="topLeft">
                          <template slot="title">
                            {{status}}
                          </template><div :class="'circle ' + status" @click="showTableModal(tableId, status, cluster)"></div>
                        </a-tooltip>
                    </div>
                    <div class="row">
                      {{tableId.toUpperCase()}}
                    </div>
                  </div>
                </div>
              </div>
            </a-list-item>
          </a-list>
        </div>
      </a-col>
    </a-row>

    <TableInfo 
      v-if="showTableInfo"
      :table="selectedTable"
      :showTableInfo="showTableInfo"
      :bookTable="bookTable"
      :allSensors="sensors"
      @close="showTableModal"
    ></TableInfo>

    <a-divider></a-divider>

    <TableSummary :tables="tables" :clusters="clusters"></TableSummary>

  </div>
</template>

<script>
import { getTables, getSensorHealth, createTable, bookTable } from "../../api"
import moment from 'moment'
import AddTable from "../../components/AddTable"
import TableInfo from "./TableInfo"
import Occupancy from "./CurrentOccupancy"
import TableSummary from "../../components/TableSummary"

export default {
  components: {
    AddTable,
    TableSummary,
    TableInfo,
    Occupancy
  },
  data() {
    return {
      tables: {},
      firstload: true,
      fetching: true,
      time: moment(),

      selectedTable: {},
      showTableInfo: false,

      sensors: {},


      visibleModal: false,
    }
  },
  mounted(){
    this.getTables()
    this.getSensorHealth()
  },
  created() {
    this.interval = setInterval(() => {
      this.getTables()
    }, 10000);
  },
  methods: {
    async getTables() {
      try {
        this.fetching = true
        var resp = await getTables()
        this.tables = resp
        this.time = moment()
      } catch {
        this.$message.error(`Error retrieving table details.`);
      } finally {
        this.fetching = false
        this.firstload = false
      }
    },
    async getSensorHealth() {
      try {
        var resp = await getSensorHealth()
        this.sensors = resp
      } catch {
        this.$message.error(`Error retrieving sensor health.`);
      }
    },
    showTableModal(tableId, status, cluster) {
      this.selectedTable.tableId = tableId
      this.selectedTable.status = status
      this.selectedTable.cluster = cluster
      this.showTableInfo = !this.showTableInfo
    },
    async createTable(data) {
      try {
        await createTable(data)
        this.$message.success(`${data.tableId.toUpperCase()} added successfully.`);
      } catch(err) {
        console.error(err)
      }
    },
    async bookTable(cluster, id) {
      try {
        await bookTable(id)
        const tables = this.tables
        var table = tables[cluster].find( ({ tableId }) => tableId === id );
        table.status = "booked"
        this.$message.success(`${id.toUpperCase()} booked successfully will be reserved for an hour.`);
      } catch(err) {
        console.error(err)
      }
    },
    clusterStatus(cluster) {
      var hogger = 0
      var avail = 0
      for (var table of cluster) {
        if (table.status == 'available') {
          avail++
        }
        if (table.status == 'hogging') {
          hogger++
        }
      }
      if (avail >= 1 ) {
        if (avail==1) return `${avail} Seat Available`
        return `${avail} Seats Available`
      }
      if (hogger >= 1 ) {
        if (hogger==1) return `${hogger} Hogged Seat`
        return `${hogger} Hogged Seat `
      }
      return 'Not Available'
    },
    showModal() {
      this.visibleModal = true
    },
    closeModal() {
      this.visibleModal = false
    },
    submitNew(data) {
      this.visibleModal = false
      this.createTable(data)
    },
  },
  computed: {
    clusters() {
      return Object.keys(this.tables) || []
    },
  }
}
</script>

<style scoped>
  .table { 
    font-size: 30px;
  }
  .available {
    background: #63C3A7;
  }
  .booked {
    background: #79b5d1;
  }
  .taken {
    background: #d3084c;
  }
  .away {
    background: #ffd152;
  }
  .hogging {
    background: #fb811d;
  }
  .legend {
    color: #fff;
    border: none;
  }
  .circle {
    width: 25px;
    height: 25px;
    border-radius: 50%;
    cursor: pointer;
  }
  .book-btn {
    border: none;
    background: transparent;
    height: 25px;
    width: 25px;
  }
  .book-btn:focus {
    outline: none;
  }
  #chartContainer {
    height: 300px;
  }
  #chartContainer1 {
    height: 300px;
  }
</style>