<template>
  <div class="TableSummary">

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
          <ejs-chart id="occContainer" :primaryXAxis='primaryXAxis' :tooltip="tooltip" :title="occupancyTitle">
            <e-series-collection>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='available' tooltipMappingName='availableA' name='available' :fill='availableFill'> </e-series>
              <e-series :dataSource='occupancyData' type='StackingBar100' xName='date' yName='occupied' tooltipMappingName='occupiedA' name='occupied'  :fill='takenFill'> </e-series>
            </e-series-collection>
          </ejs-chart>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card :loading="occupancyLoading">
          <p class="h5 mb-3 text-center">Hogging
          <a-dropdown>
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
    </a-row>
    
  </div>
</template>

<script>
import Vue from "vue";
import { getTableSummary } from "../api"
import { ChartPlugin, StackingBarSeries, Category, Tooltip } from "@syncfusion/ej2-vue-charts";

Vue.use(ChartPlugin);

export default {
  provide: {
    chart: [StackingBarSeries, Category, Tooltip ]
  },
  props: ['tables', 'clusters'],
  data() {
    return {
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
      totalHog: 0,
      hoggingType: 'office-wide',
      hoggingTypes: ['office-wide', 'per seat']
    }
  },
  mounted(){
    this.getTableSummary({ range: 7 })
  },
  methods: {
    formatHoggingData(resp, perSeat) {
      if (perSeat) {
        var totalSeats = 0
        for (var cluster in this.tables) {
          totalSeats += this.tables[cluster].length
        }
      }
      var hoggingData = []
      var totalHog = 0
      for (var key in resp) {
        var hoggedHours = resp[key]['hoggedHours']
        totalHog += perSeat ? hoggedHours / totalSeats : hoggedHours
        var hogObj = {
          date: key,
          hogged: perSeat ? hoggedHours / totalSeats : hoggedHours,
          hoggedA: (perSeat ? hoggedHours / totalSeats : hoggedHours.toFixed(2)) + ' hours',
        }
        hoggingData.push(hogObj)
      }
      this.hoggingData = hoggingData
      this.totalHog = totalHog
    },
    async getTableSummary(params) {
      try {
        this.occupancyLoading = true
        this.hoggingLoading = true
        var resp = await getTableSummary(params)
        this.resp = resp
        var occupancyData = []
        var occ = 0
        var totalOcc = 0
        for (var key in resp) {
          var total = resp[key]['total']
          occ += (resp[key]['hogging'] + resp[key]['away'] + resp[key]['booked'] + resp[key]['taken'])
          totalOcc += total
          var available = resp[key]['available']
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
        this.occupancyData = occupancyData
        this.avgOcc = (totalOcc == 0 ? 0 : occ / totalOcc)
        this.formatHoggingData(resp, false)
      } catch {
        this.$message.error(`Error retrieving past statistics.`);
      } finally {
        this.occupancyLoading = false
        this.hoggingLoading = false
      }
    },
    handleSummaryClick(e) {
      this.occupancyRange = e.key
      this.getTableSummary({ range: e.key })
    },
    handleHogClick(e) {
      this.hoggingType = e.key
      this.formatHoggingData(this.resp, e.key=='per seat')
    },
  },
  computed: {
    occupancyTitle() {
      return this.avgOcc.toFixed(2)*100 + '% of seats occupied'
    },
    hoggingTitle() {
      return 'Avg ' + this.totalHog.toFixed(1) + ' hours of daily hogging '
    },
  }
};
</script>

<style>
#occContainer, #hogContainer {
  height: 250px
}
</style>