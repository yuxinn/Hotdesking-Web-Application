<template>
  <div class="Dashboard mb-4">
    <p class="h4 mb-3">Hot Desk Summary</p>
    <div style="background-color: #ececec; padding: 20px;">
      <a-list v-for="cluster in clusters" :key="cluster" itemLayout="horizontal" :dataSource="cluster">
        <a-list-item slot="renderItem" slot-scope="item">
          <a-list-item-meta>
            <div slot="title">Cluster {{item}}</div>
            <div slot="description">
              {{clusterStatus(tables[cluster])}}
            </div>
          </a-list-item-meta>
          <div class="content">
            <div class="tables row">
              <div class="col-auto mr-3" v-for="{tableid, status} in tables[cluster]" :key="tableid">
                <div class="row d-flex justify-content-center">
                  <div :class="'circle ' + status">
                    <a-popconfirm
                      v-if="status=='available'"
                      placement="topRight"
                      :title="`Book ${tableid}?`"
                      okText="Book"
                      @confirm="() => bookTable(cluster, tableid)"
                    >
                      <a-icon slot="icon" type="tag" style="color: dimgray" />
                      <button class="book-btn" href="javascript:;" ></button>
                    </a-popconfirm>
                  </div>
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
import { getTables, createTable,  } from "../../api"

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
        ],
        C: [
          {
          tableid: "c_01",
          status: "taken"
          },
          {
          tableid: "c_02",
          status: "hogging"
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
    },
    async bookTable(cluster, id) {
      try {
        // await bookTable(tableid)
        const tables = this.tables
        var table = tables[cluster].find( ({ tableid }) => tableid === id );
        table.status = "booked"

        this.$message.success(`${id} will be reserved for an hour.`);
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
  .hogging {
    background: rgb(251, 155, 29);
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
</style>