<template>
  <div class="CurrentOccupancy">
    <a-radio-group v-model="view">
      <a-radio-button value="chart">Chart</a-radio-button>
      <a-radio-button value="numbers">Numbers</a-radio-button>
    </a-radio-group>
    <div class="row mt-2" v-if="view=='numbers'">
      <div class="col-6 mb-1">
        <a-statistic :value="numAvailable">
          <template v-slot:title>
            <span style="font-weight: 600;">Seats Available</span>
          </template>
          <template v-slot:suffix>
            <a-icon v-if="numAvailable>0" type="smile" class="ml-3" style="vertical-align: 2px; color: green; font-size: 20px" />
            <a-icon v-else type="frown" class="ml-3" style="vertical-align: 2px; color: red; font-size: 20px" />
          </template>
        </a-statistic>
      </div>
      <div class="col-6 mb-1">
        <a-statistic :value="numTaken">
          <template v-slot:title>
            <span style="font-weight: 600;">Seats Taken</span>
          </template>
          <template v-slot:suffix>
            <a-icon type="laptop" class="ml-3" style="vertical-align: 2px; color: #d3084c; font-size: 20px" />
          </template>
        </a-statistic>
      </div>
      <div class="col-6 mb-1">
        <a-statistic v-if="numHogging>0" :value="numHogging">
          <template v-slot:title>
            <span style="font-weight: 600;">Seats Hogged</span>
          </template>
          <template v-slot:suffix>
            <a-icon type="alert" class="ml-3" style="vertical-align: 2px; color: #fb811d; font-size: 20px" />
          </template>
        </a-statistic>
      </div>
    </div>

    <ejs-accumulationchart v-else id="container"  :tooltip="tooltip">
      <e-accumulation-series-collection>
        <e-accumulation-series :dataSource='seriesData' xName='x' yName='y' tooltipMappingName='hover'  :dataLabel='datalabel' radius='65%' :pointColorMapping=' pointColorMapping'> </e-accumulation-series>
      </e-accumulation-series-collection>
   </ejs-accumulationchart>

  </div>
</template>

<script>
import Vue from "vue";
import { AccumulationChartPlugin, PieSeries, AccumulationDataLabel, AccumulationTooltip } from "@syncfusion/ej2-vue-charts";

Vue.use(AccumulationChartPlugin);

export default {
  props: {
    tables: Object,
  },
  data() {
    return {
      view: 'chart',
      seriesData: [],
      datalabel: { visible: true, name: 'text', position: 'Outside' },
      enableSmartLabels: false,
      pointColorMapping: 'fill',
      tooltip: { 
        enable: true,
        format: '${point.tooltip}'
      },
    }
  },
  computed: {
    clusters() {
      return Object.keys(this.tables)
    },
    numTables() {
      var count = 0
      for (var cluster of this.clusters) {
        count += this.tables[cluster].length
      }
      return count
    },
    numAvailable() {
      var avail = 0
      for (var cluster of this.clusters) {
        avail += this.tables[cluster].filter((obj) => obj.status === 'available').length;
      }
      return avail
    },
    numBooked() {
      var avail = 0
      for (var cluster of this.clusters) {
        avail += this.tables[cluster].filter((obj) => obj.status === 'booked').length;
      }
      return avail
    },
    numAway() {
      var avail = 0
      for (var cluster of this.clusters) {
        avail += this.tables[cluster].filter((obj) => obj.status === 'away').length;
      }
      return avail
    },
    numTaken() {
      var avail = 0
      for (var cluster of this.clusters) {
        avail += this.tables[cluster].filter((obj) => obj.status === 'taken').length;
      }
      return avail
    },
    numHogging() {
      var avail = 0
      for (var cluster of this.clusters) {
        avail += this.tables[cluster].filter((obj) => obj.status === 'hogging').length;
      }
      return avail
    }
  },
  watch: {
    tables() {
      this.updateData()
    }
  },
  methods: {
    updateData() {
      var status = {avail: 0, booked: 0, taken: 0, away: 0, hogging: 0}
      
      this.seriesData = []
      for (var cluster of this.clusters) {
        status.avail += this.tables[cluster].filter((obj) => obj.status === 'available').length;
        status.booked += this.tables[cluster].filter((obj) => obj.status === 'booked').length;
        status.taken += this.tables[cluster].filter((obj) => obj.status === 'taken').length;
        status.away += this.tables[cluster].filter((obj) => obj.status === 'away').length;
        status.hogging += this.tables[cluster].filter((obj) => obj.status === 'hogging').length;
      }

      var total = status.avail + status.booked + status.taken + status.away + status.hogging

      this.seriesData = [ { x: 'Available', y: status.avail, fill: '#63c3a7', text:'Avail ' + Math.round((status.avail/total)*100,2) + '%', hover: 'Available: ' + this.numAvailable },
                          { x: 'Booked', y: status.booked, fill: '#115f83', text:'Booked '  + Math.round((status.booked/total)*100,2) + '%', hover: 'Booked: ' + this.numBooked },
                          { x: 'Taken', y: status.taken, fill: '#d3084c', text:'Taken '  + Math.round((status.taken/total)*100,2) + '%', hover: 'Taken: ' + this.numTaken },
                          { x: 'Away', y: status.away, fill: '#ffd152', text:'Away ' + Math.round((status.away/total)*100,2) + '%', hover: 'Away: ' + this.numAway },
                          { x: 'Hogging', y: status.hogging, fill: '#fb811d', text:'Hogging ' + Math.round((status.hogging/total)*100,2) + '%', hover: 'Hoging: ' + this.numHogging },
                        ]
    }
  },
  provide: {
    accumulationchart: [PieSeries, AccumulationDataLabel, AccumulationTooltip],
  }
}
</script>

<style>
 #container {
  height: 220px;
  max-width: 100%;
 }
</style>