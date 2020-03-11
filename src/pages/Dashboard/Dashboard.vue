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
        <a-tag class="availablelegend">Available</a-tag>
        <a-tag class="bookedlegend">Booked</a-tag>
        <a-tag class="takenlegend">Taken</a-tag>
        <a-tag class="awaylegend">Away</a-tag>
        <a-tag class="hogginglegend  mr-0">Hogging</a-tag>
      </div>
    </div>

    <AddTable v-if="visibleModal" :visibleModal="visibleModal" @close="closeModal" @submit="submitNew"></AddTable>

    <div style="background-color: #ececec; padding: 20px;">
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
                  <div :class="'circle ' + status">
                    <a-popconfirm
                      v-if="status=='available'"
                      placement="topRight"
                      :title="`Book ${tableId.toUpperCase()}?`"
                      okText="Book"
                      @confirm="() => bookTable(cluster, tableId)"
                    >
                      <a-icon slot="icon" type="tag" style="color: dimgray" />
                      <button class="book-btn" href="javascript:;" ></button>
                    </a-popconfirm>
                  </div>
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

    <br>
    
    <a-card :loading="summaryLoading">
      <div class="d-flex justify-content-between mb-3" >
        <p class="h4 mb-3">Past Occupancy</p>
        <a-dropdown>
          <a-menu slot="overlay" @click="handleSummaryClick">
            <a-menu-item v-for="range in summaryRanges" :key="range">{{range}} Days</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> {{summaryRange}} Days <a-icon type="down" /> </a-button>
        </a-dropdown>
      </div>
      <ejs-chart id="chartContainer" :primaryXAxis='primaryXAxis' :tooltip="tooltip">
        <e-series-collection>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='available' tooltipMappingName='availableA' name='available' :fill='availableFill'> </e-series>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='away' tooltipMappingName='awayA' name='away'  :fill='awayFill'> </e-series>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='booked' tooltipMappingName='bookedA' name='booked'  :fill='bookedFill'> </e-series>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='hogging' tooltipMappingName='hoggingA' name='hogging'  :fill='hoggingFill'> </e-series>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='taken' tooltipMappingName='takenA' name='taken'  :fill='takenFill'> </e-series>
          <e-series :dataSource='seriesData' type='StackingBar100' xName='date' yName='total' name='total'> </e-series>
        </e-series-collection>
      </ejs-chart>
    </a-card>

  </div>
</template>

<script>
import Vue from "vue";
import { getTables, getTableSummary, createTable, bookTable } from "../../api"
import moment from 'moment'
import AddTable from "../../components/AddTable"
import { ChartPlugin, StackingBarSeries, Category, Tooltip } from "@syncfusion/ej2-vue-charts";

Vue.use(ChartPlugin);

export default {
  provide: {
    chart: [StackingBarSeries, Category, Tooltip ]
  },
  components: {
    AddTable,
  },
  data() {
    return {
      tables: {},
      firstload: true,
      fetching: true,
      time: moment(),
      visibleModal: false,
      // summary
      summaryLoading: true,
      summaryRange: 7,
      summaryRanges: [7, 30, 90],
      seriesData:[],
      availableFill: '#63C3A7',
      awayFill: 'rgb(255, 209, 82)',
      bookedFill: 'rgb(118, 194, 230)',
      hoggingFill: 'rgb(251, 129, 29)',
      takenFill: 'rgb(211, 8, 75)',
      primaryXAxis: {
        valueType: 'Category',
      },
      tooltip: { 
        enable: true,
        format: '${point.tooltip}'
      },
    }
  },
  mounted(){
    this.getTables()
    this.getTableSummary({ range: 7 })
  },
  created() {
    this.interval = setInterval(() => {
      this.getTables()
    }, 7000);
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
    async getTableSummary(params) {
      try {
        this.summaryLoading = true
        var resp = await getTableSummary(params)
        var seriesData = []
        for (var key in resp) {
          var total = resp[key]['total']
          var data = {
            date: key,
            available: resp[key]['available'] / total,
            availableA: resp[key]['available'],
            away: resp[key]['away'] / total,
            awayA: resp[key]['away'],
            booked: resp[key]['booked'] / total,
            bookedA: resp[key]['booked'],
            hogging: resp[key]['hogging'] / total,
            hoggingA: resp[key]['hogging'],
            taken: resp[key]['taken'] / total,
            takenA: resp[key]['taken'],
          }
          seriesData.push(data)
        }
        this.seriesData = seriesData
      } catch {
        this.$message.error(`Error retrieving occupancy summary.`);
      } finally {
        this.summaryLoading = false
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
      this.summaryRange = e.key
      this.getTableSummary({ range: e.key })
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
    cursor: pointer;
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
  .availabletext {
    color: #63C3A7;
  }
  .bookedtext {
    color: rgb(118, 194, 230);
  }
  .takentext {
    color: rgb(211, 8, 75);
  }
  .hoggingtext {
    color: rgb(251, 155, 29);
  }
  .availablelegend {
    background: #63C3A7;
    color: #fff;
    border: None;
  }
  .bookedlegend {
    background: rgb(118, 194, 230);
    color: #fff;
    border: None;
  }
  .takenlegend {
    background: rgb(211, 8, 75);
    color: #fff;
    border: None;
  }
  .awaylegend {
    background: rgb(255, 209, 82);
    color: #fff;
    border: None;
  }
  .hogginglegend {
    background: rgb(251, 129, 29);
    color: #fff;
    border: None;
  }
  .circle {
    width: 25px;
    height: 25px;
    border-radius: 50%;
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
</style>