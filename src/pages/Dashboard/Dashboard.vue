<template>
  <div class="Dashboard mb-4">
    <p class="h4 mb-3">Hot Desk Summary</p>
    <div style="background-color: #ececec; padding: 20px;">
      <a-list v-for="cluster in clusters" :key="cluster" itemLayout="horizontal" :dataSource="cluster">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-list-item-meta
            description="Available / Not Available / Hoggers Detected"
          >
            <a slot="title">Cluster {{item}}</a>
          </a-list-item-meta>
          <div class="content">
            <div class="tables row">
              <div class="col-auto mr-3" v-for="{tableid, status} in tables[cluster]" :key="tableid">
                <div class="row d-flex justify-content-center">
                  <div :class="'circle ' + status"></div>
                </div>
                <div class="row">
                  {{tableid}}
                </div>
              </div>
            </div>
          </div>
        </a-list-item>
      </a-list>

    </div>
  </div>
</template>

<script>
import { getTables, createTable } from "../../api"

export default {
  components: {

  },
  data() {
    return {
        tables: {},
        tableid: "",
        status: "available"
    }
  },
  mounted(){
    // this.getTables()
    this.tables = {
        A: [
          {
          tableid: "a_01",
          status: "booked"
          },
          {
          tableid: "a_02",
          status: "taken"
          },
          {
          tableid: "a_03",
          status: "available"
          },
          {
          tableid: "a_04",
          status: "hogging"
          },
          {
          tableid: "a_05",
          status: "available"
          }
        ],
        B: [
          {
          tableid: "b_01",
          status: "taken"
          },
          {
          tableid: "b_02",
          status: "taken"
          }
        ]
      }
  },
  methods: {
    async getTables() {
      var resp = await getTables()
      this.tables = resp
      console.log(resp)
    },
    async createTable() {
      var data = { tableid: this.tableid, status: this.status }
      var resp = await createTable(data)
      console.log(resp)
    }
  },
  computed: {
    clusters() {
      return Object.keys(this.tables) || []
    }
  }
}
</script>

<style scoped>
  .table { 
    font-size: 30px
  }
  .available {
    /* background: #B0E57C; */
    background: #63C3A7;
  }
  .booked {
    background: rgb(118, 194, 230);
    /* background: #7F7BBA; */
  }
  .taken {
    /* background: #F37257; */
    background: rgb(211, 8, 75);
  }
  .hogging {
    /* background: #F4D27A; */
    background: rgb(251, 155, 29);
  }
  .circle {
    width: 25px;
    height: 25px;
    border-radius: 50%
  }
</style>