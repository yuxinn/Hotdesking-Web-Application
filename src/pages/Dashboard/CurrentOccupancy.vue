<template>
  <div class="CurrentOccupancy">
    <ejs-accumulationchart id="container" enableSmartLabels='enableSmartLabels'>
      <e-accumulation-series-collection>
        <e-accumulation-series :dataSource='seriesData' xName='x' yName='y' :dataLabel='datalabel' radius='70%' :pointColorMapping=' pointColorMapping'> </e-accumulation-series>
      </e-accumulation-series-collection>
   </ejs-accumulationchart>
  </div>
</template>

<script>
import Vue from "vue";
import { AccumulationChartPlugin, PieSeries, AccumulationDataLabel } from "@syncfusion/ej2-vue-charts";

Vue.use(AccumulationChartPlugin);

export default {
  props: {
    tables: Object,
  },
  data() {
    return {
      seriesData: [],
                datalabel: { visible: true, name: 'text', position: 'Outside' },
                enableSmartLabels: true,
                pointColorMapping: 'fill'
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
      this.seriesData = [ { x: 'Available', y: status.avail, fill: '#63c3a7', text:'Available' },
                          { x: 'Booked', y: status.booked, fill: '#79b5d1', text:'Booked' },
                          { x: 'Taken', y: status.taken, fill: '#d3084c', text:'Taken' },
                          { x: 'Away', y: status.away, fill: '#ffd152', text:'Away' },
                          { x: 'Hogging', y: status.hogging, fill: '#fb811d', text:'Hogging' },
                        ]
    }
  },
  provide: {
    accumulationchart: [PieSeries, AccumulationDataLabel]
  }
}
</script>

<style>
 #container {
  height: 200px;
  max-width: 90%;
 }
</style>