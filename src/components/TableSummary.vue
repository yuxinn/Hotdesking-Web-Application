<template>
  <div class="TableSummary">

    <div class="d-flex justify-content-between mb-3">
      <p class="h4 mb-3">Past Statistics</p>
      <span>
        Table
        <a-dropdown>
          <a-menu v-if="!graphsLoading" slot="overlay" @click="handleTableClick">
            <a-menu-item v-for="range in tableOptions" :key="range"> {{range.toUpperCase()}} </a-menu-item>
          </a-menu>
          <a-button v-if="graphsLoading" style="margin-left: 8px"><a-icon type="loading" /></a-button>
          <a-button v-else style="margin-left: 8px"> {{tableShown.toUpperCase()}} <a-icon type="down" /> </a-button>
        </a-dropdown>
        <a-dropdown>
          <a-menu slot="overlay" @click="handleSummaryClick">
            <a-menu-item v-for="range in occupancyRanges" :key="range">{{range}} Days</a-menu-item>
          </a-menu>
          <a-button style="margin-left: 8px"> {{occupancyRange}} Days <a-icon type="down" /> </a-button>
        </a-dropdown>
      </span>
      
    </div>

    <a-row :gutter="16">
      <a-col :xs="24" :lg="6">
        <a-card :loading="graphsLoading" :bordered="false">
          <p class="h5 mb-3 text-center">Summary</p>
          <ejs-accumulationchart id="sumContainer" :tooltip="tooltipPie">
            <e-accumulation-series-collection>
              <e-accumulation-series :dataSource='summaryData' xName='x' yName='y' tooltipMappingName='text' :pointColorMapping='pointColorMapping'> </e-accumulation-series>
            </e-accumulation-series-collection>
          </ejs-accumulationchart>
        </a-card>
      </a-col>
      <a-col :md="24" :lg="9">
        <a-card :loading="graphsLoading" :bordered="false">
          <p class="h5 mb-3 text-center">Occupancy</p>
          <ejs-chart id="occContainer" :primaryXAxis='primaryXAxis' :tooltip="tooltip" :title="occupancyTitle">
            <e-series-collection>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='available' tooltipMappingName='availableA' name='available' :fill='availableFill'> </e-series>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='occupied' tooltipMappingName='occupiedA' name='occupied'  :fill='miscFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="9">
        <a-card :loading="hogLoading" :bordered="false">
          <p class="h5 mb-3 text-center">Hogging
          <a-dropdown v-if="tableShown=='all'">
            <a class="ant-dropdown-link" href="#"> {{hoggingType}} <a-icon type="down" /> </a>
            <a-menu slot="overlay" @click="handleHogClick">
              <a-menu-item v-for="hogType in hoggingTypes" :key="hogType">{{hogType}}</a-menu-item>
            </a-menu>
          </a-dropdown></p>
          <ejs-chart id="hogContainer" :primaryXAxis='primaryXAxis' :tooltip="tooltip" :title="hoggingTitle">
            <e-series-collection>
              <e-series :dataSource='hoggingData' type='StackingBar' xName='date' yName='hogged' tooltipMappingName='hoggedA' name='hogged' :fill='hoggingFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
      <a-col :md="24" :lg="24">
        <a-card :loading="hourlyLoading" :bordered="false">
          <p class="h5 mb-3 text-center">Busy Hours</p>
          <ejs-chart id="popularContainer" :primaryXAxis='primaryXAxis' :primaryYAxis='primaryYAxis' :tooltip="tooltip">
            <e-series-collection>
              <e-series :dataSource='popularData' type='Column' xName='time' yName='occupied' tooltipMappingName='text' name='occupied' :pointColorMapping='pointColorMapping' :fill='miscFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
    </a-row>
    
  </div>
</template>

<script>
import Vue from "vue";
import { getTableSummary, getHourlySummary } from "../api"
import { AccumulationChartPlugin, PieSeries, AccumulationTooltip, ChartPlugin, StackingBarSeries, Category, Tooltip, ColumnSeries } from "@syncfusion/ej2-vue-charts";

Vue.use(AccumulationChartPlugin);
Vue.use(ChartPlugin);

export default {
  provide: {
    chart: [StackingBarSeries, Category, Tooltip, ColumnSeries ],
    accumulationchart: [PieSeries, AccumulationTooltip ],
  },
  props: ['tables', 'clusters'],
  data() {
    return {
      graphsLoading: true,
      hourlyLoading: true,
      hogLoading: true,
      tableShown: 'all',
      tableOptions: [],
      miscFill: '#404041',
      // summary
      summaryData: [],
      pointColorMapping: 'fill',
      // popular
      popularData: [],
      // occupancy
      occupancyRange: 7,
      occupancyRanges: [7, 30, 90],
      occupancyData: [],
      availableFill: '#63C3A7',
      // takenFill: 'rgb(211, 8, 75)',
      primaryXAxis: {
        valueType: 'Category',
      },
      primaryYAxis: {
        labelFormat: '{value}%'
      },
      tooltipPie: {
        enable: true,
        format: '${point.x} : <b>${point.tooltip}%</b>'
      },
      tooltip: { 
        enable: true,
        format: '${point.tooltip}'
      },
      avgOcc: 0,
      // hogging
      hoggingData: [],
      hoggingFill: 'rgb(251, 129, 29)',
      totalHog: 0,
      totalSeats: 0,
      hoggingType: 'office-wide',
      hoggingTypes: ['office-wide', 'per seat']
    }
  },
  mounted(){
    this.getTableSummary({ range: 7 })
    this.getHourlySummary()
  },
  methods: {
    formatHoggingData(perSeat) {
      this.hogLoading = true
      var resp = this.resp
      var hoggingData = []
      var totalHog = 0
      var hogObj = {}
      var hoggedHours = 0

      var filterFrom = perSeat ? resp['all'] : resp[this.tableShown]
      for (var dateAll in filterFrom) {
        hoggedHours = filterFrom[dateAll]['hoggedHours']
        if (perSeat) hoggedHours /= this.totalSeats
        totalHog += hoggedHours
        hogObj = {
          date: dateAll,
          hogged: hoggedHours,
          hoggedA: hoggedHours.toFixed(1) + ' mins',
        }
        hoggingData.push(hogObj)
      }
      this.hoggingData = hoggingData
      this.totalHog = totalHog
      this.hogLoading = false
    },
    filterGraphData() {
      var resp = this.resp[this.tableShown]
      var totalAvail = 0
      var totalBooked = 0
      var totalTaken = 0
      var totalAway = 0
      var totalHog = 0
      var occupancyData = []
      var occ = 0
      var totalOcc = 0
      var totalTotal = 0
      for (var key in resp) {
        var total = resp[key]['total']
        var available = resp[key]['available']
        var booked = resp[key]['booked']
        var taken = resp[key]['taken']
        var away = resp[key]['away']
        var hogging = resp[key]['hogging']
        totalTotal += total
        totalAvail += available
        totalBooked += booked
        totalTaken += taken
        totalAway += away
        totalHog += hogging

        occ += (resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken'])
        totalOcc += total
        var apercent = available / total
        var occupied = (resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken'])
        var opercent = occupied / total
        var sumObj = {
          date: key,
          available: apercent,
          availableA: available + ' seats (' + (apercent*100).toFixed(2) + '%)',
          occupied: opercent,
          occupiedA: occupied + ' seats (' + (opercent*100).toFixed(2) + '%)',
        }
        occupancyData.push(sumObj)
      }
      this.summaryData = [
        { x: 'Available', y: totalAvail, fill: '#63c3a7', text: (totalAvail/totalTotal*100).toFixed(2) },
        { x: 'Booked', y: totalBooked, fill: '#115f83', text: (totalBooked/totalTotal*100).toFixed(2) },
        { x: 'Taken', y: totalTaken, fill: '#d3084c', text: (totalTaken/totalTotal*100).toFixed(2) },
        { x: 'Away', y: totalAway, fill: '#ffd152', text: (totalAway/totalTotal*100).toFixed(2) },
        { x: 'Hogging', y: totalHog, fill: '#fb811d', text: (totalHog/totalTotal*100).toFixed(2) },
      ]
      this.occupancyData = occupancyData
      this.avgOcc = (totalOcc == 0 ? 0 : occ / totalOcc)
      this.formatHoggingData(false)
    },
    async getTableSummary(params) {
      try {
        this.graphsLoading = true
        this.hogLoading = true
        var resp = await getTableSummary(params)
        this.tableOptions = Object.keys(resp)
        this.resp = resp
        this.totalSeats = Object.keys(resp).length - 1
        this.filterGraphData()
      } catch {
        this.$message.error(`Error retrieving past table data.`);
      } finally {
        this.graphsLoading = false
        this.hogLoading = false
      }
    },
    async getHourlySummary() {
      try {
        this.hourlyLoading = true
        var resp = await getHourlySummary()
        var popularData = []
        Object.keys(resp).forEach((key) => {
          var hourData = resp[key]
          if (key >=9 && key <= 21) {
            var total = hourData['total']
            var occupied = 0
            if (total) {
              occupied = (total - hourData['available']) / total * 100
            }
            popularData.push({
              time: (key.length > 1 ? key : '0' + key) + ':00',
              occupied: occupied,
              text: occupied.toFixed(2) + '%'
            })
          }
          
        })
        this.popularData = popularData
      } catch {
        this.$message.error(`Error retrieving past hourly data.`);
      } finally {
        this.hourlyLoading = false
      }
    },
    handleTableClick(e) {
      this.tableShown = e.key
      this.filterGraphData()
    },
    handleSummaryClick(e) {
      this.occupancyRange = e.key
      this.getTableSummary({ range: e.key })
    },
    handleHogClick(e) {
      this.hoggingType = e.key
      this.formatHoggingData(e.key=='per seat')
    },
  },
  computed: {
    occupancyTitle() {
      return (this.avgOcc*100).toFixed(0) + '% of seats occupied'
    },
    hoggingTitle() {
      return 'Avg ' + this.totalHog.toFixed(1) + ' mins of daily hogging '
    },
  }
};
</script>

<style>
#sumContainer, #popularContainer, #occContainer, #hogContainer {
  height: 250px
}
</style>