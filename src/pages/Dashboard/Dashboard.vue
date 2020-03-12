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
      <!-- <a-col class="gutter-row" :span="6">
        <div class="gutter-box">pie chart on current occupancy</div>
      </a-col> -->
      <!-- <a-col class="gutter-row" :span="18"> -->
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
      <!-- </a-col> -->
    </a-row>

    <TableInfo 
      v-if="showTableInfo"
      :table="selectedTable"
      :showTableInfo="showTableInfo"
      :bookTable="bookTable"
      @close="showTableModal"
    ></TableInfo>

    <a-divider></a-divider>

    <div class="d-flex justify-content-between mb-3">
      <p class="h4 mb-3">Past Statistics</p>
      <a-dropdown>
        <a-menu slot="overlay" @click="handleSummaryClick">
          <a-menu-item v-for="range in occupancyRanges" :key="range">{{range}} Days</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> {{occupancyRange}} Days <a-icon type="down" /> </a-button>
      </a-dropdown>
    </div>

    <a-row :gutter="16">
      <a-col :md="24" :lg="12">
        <a-card :loading="occupancyLoading">
          <p class="h5 mb-3 text-center">Occupancy</p>
          <ejs-chart id="chartContainer" :primaryXAxis='primaryXAxis' :tooltip="tooltip" :title="occupancyTitle">
            <e-series-collection>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='available' tooltipMappingName='availableA' name='available' :fill='availableFill'> </e-series>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='occupied' tooltipMappingName='occupiedA' name='occupied'  :fill='takenFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card :loading="occupancyLoading">
          <p class="h5 mb-3 text-center">Hours Hogged</p>
          <ejs-chart id="chartContainer1" :primaryXAxis='primaryXAxis' :tooltip="tooltip" :title="hoggingTitle">
            <e-series-collection>
              <e-series :dataSource='hoggingData' type='StackingBar' xName='date' yName='hoggedHours' tooltipMappingName='hoggedHoursA' name='hoggedHours' :fill='hoggingFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
    </a-row>
    

  </div>
</template>

<script>
import { getTables, getTableSummary, createTable, bookTable } from "../../api"
import moment from 'moment'
import AddTable from "../../components/AddTable"
import TableInfo from "./TableInfo"
import { StackingBarSeries, Category, Tooltip } from "@syncfusion/ej2-vue-charts";

export default {
  provide: {
    chart: [StackingBarSeries, Category, Tooltip ]
  },
  components: {
    AddTable,
    TableInfo,
  },
  data() {
    return {
      tables: {},
      firstload: true,
      fetching: true,
      time: moment(),

      selectedTable: {},
      showTableInfo: false,


      visibleModal: false,
      // occupancy
      occupancyLoading: true,
      occupancyRange: 7,
      occupancyRanges: [7, 30, 90],
      occupancyData: [],
      availableFill: '#63C3A7',
      takenFill: 'rgb(211, 8, 75)',
      primaryXAxis: {
        valueType: 'Category',
      },
      tooltip: { 
        enable: true,
        format: '${point.tooltip}'
      },
      avgOcc: 0,
      // hogging
      hoggingLoading: true,
      hoggingData: [],
      hoggingFill: 'rgb(251, 129, 29)',
      totalHog: 0
    }
  },
  mounted(){
    this.getTables()
    this.getTableSummary({ range: 7 })
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
    showTableModal(tableId, status, cluster) {
      this.selectedTable.tableId = tableId
      this.selectedTable.status = status
      this.selectedTable.cluster = cluster
      this.showTableInfo = !this.showTableInfo
    },
    async getTableSummary(params) {
      try {
        this.occupancyLoading = true
        this.hoggingLoading = true
        var resp = await getTableSummary(params)
        var occupancyData = []
        var hoggingData = []
        var totalOcc = 0
        var totalValid = 0
        var totalHog = 0
        for (var key in resp) {
          var total = resp[key]['total']
          if (total > 0) {
            totalOcc += (resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken']) / total
            totalValid += 1
          }
          totalHog += resp[key]['hoggedHours']
          var sumObj = {
            date: key,
            available: resp[key]['available'] / total,
            availableA: resp[key]['available'] + ' seats',
            occupied: resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken'],
            occupiedA: resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken']  + ' seats',
          }
          var hogObj = {
            date: key,
            hoggedHours: resp[key]['hoggedHours'],
            hoggedHoursA: resp[key]['hoggedHours'] + ' hours',
          }
          occupancyData.push(sumObj)
          hoggingData.push(hogObj)
        }
        this.occupancyData = occupancyData
        this.avgOcc = totalOcc / totalValid
        this.hoggingData = hoggingData
        this.totalHog = totalHog
      } catch {
        this.$message.error(`Error retrieving occupancy occupancy.`);
      } finally {
        this.occupancyLoading = false
        this.hoggingLoading = false
      }
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
    handleSummaryClick(e) {
      this.occupancyRange = e.key
      this.getTableSummary({ range: e.key })
    },
  },
  computed: {
    clusters() {
      return Object.keys(this.tables) || []
    },
    occupancyTitle() {
      return this.avgOcc.toFixed(2) + '% occupied over ' + this.occupancyRange + ' days' 
    },
    hoggingTitle() {
      return 'Total of ' + this.totalHog.toFixed(2) + ' hours hogged over ' + this.occupancyRange + ' days' 
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