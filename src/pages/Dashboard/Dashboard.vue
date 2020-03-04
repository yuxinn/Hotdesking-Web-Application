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


  </div>
</template>

<script>
import { getTables, createTable, bookTable } from "../../api"
import moment from 'moment'
import AddTable from "../../components/AddTable"

export default {
  components: {
    AddTable
  },
  data() {
    return {
      tables: {},
      firstload: true,
      fetching: true,
      time: moment(),
      visibleModal: false,
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
    async createTable(data) {
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
</style>