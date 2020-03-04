<template>
  <div class="Dashboard mb-4">
    <p class="h4 mb-3">Hot Desk Summary</p>
    <div class="d-flex justify-content-end mb-3">
      <a-spin v-if="fetching" size="small" />
      <a-tag v-else class="mr-0 pl-0" style="cursor: default;">
        <a-icon type="check-circle" style="vertical-align: 1px;" class="mx-2"/>
        Last Updated: {{time.format("MMMM Do YYYY, HH:mm:ss")}}
      </a-tag>
    </div>
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
  </div>
</template>

<script>
import { getTables, createTable, bookTable } from "../../api"
import moment from 'moment'

export default {
  data() {
    return {
      tables: {},
      firstload: true,
      fetching: true,
      time: moment()
    }
  },
  mounted(){
    this.getTables()
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
    async createTable() {
      var data = { tableId: this.tableId, status: this.status }
      var resp = await createTable(data)
      console.log(resp)
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