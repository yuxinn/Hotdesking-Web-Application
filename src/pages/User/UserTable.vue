<template>
  <div class="UserTable">
    {{searchText}}
    <a-table
      class="mt-3"
      :columns="columns"
      :rowKey="record => record.email"
      :dataSource="data"
      :pagination="pagination"
      :loading="loading"
      size="middle" 
    >
      <template
        v-for="col in ['department', 'jobtitle', 'name']"
        :slot="col"
        slot-scope="text, record"
      >
        <div :key="col">
          <!-- if column editable -->
          <a-input
            v-if="!loading && record && record.editable"
            style="margin: -5px 0"
            :value="cacheData.filter(item => record.email === item.email)[0][col]"
            @change="e => handleInputChange(e.target.value, record.email, col)"
          />
          <!-- else if searched -->
          <span v-else-if="searchText">
            <template v-for="(fragment, i) in text.toString().split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <mark
              v-if="fragment.toLowerCase() === searchText.toLowerCase()"
              :key="i"
              class="highlight"
            >{{fragment}}</mark>
            <template v-else>{{fragment}}</template>
          </template>
        </span>
        <!-- else show the text as it is -->
        <template v-else>{{text}}</template>
        </div>
      </template>

      <template slot="actions" slot-scope="record">
        <template v-if="record.editable" >
          <a-icon type="save" style="color: #1890ff;" @click="save(record.email)" />
          <a-divider type="vertical" />
          <a-icon style="color: red" type="close" @click="cancel(record.email)" />
        </template>
        <template v-else>
          <a><a-icon @click="() => edit(record.email)" style="color: #1890ff;" type="edit" /></a>
          <a-divider type="vertical" />
          <a-popconfirm
            :title="'Delete user \'' + record.name +'\'?'"
            @confirm="() => onDelete(record)"
          >
            <a href="javascript:;"><a-icon class="deletebtn" type="delete" /></a>
          </a-popconfirm>
        </template>
      </template>

      <div
        slot="filterDropdown"
        slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }"
        style="padding: 8px"
      >
        <a-input
          v-ant-ref="c => searchInput = c"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm)"
          style="width: 188px; margin-bottom: 8px; display: block;"
        />
        <a-button
          type="primary"
          @click="() => handleSearch(selectedKeys, confirm)"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px">Search</a-button
        >
        <a-button @click="() => handleReset(clearFilters)" size="small" style="width: 90px">
          Reset
        </a-button>
      </div>

      <!-- Search Icon -->
      <a-icon
        slot="filterIcon"
        slot-scope="filtered"
        type="search"
        :style="{ color: filtered ? '#108ee9' : undefined }"
      />

    </a-table>
  </div>
</template>

<script>
import { updateUser, deleteUser } from '../../api'

export default {
  props: {
    users: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      required: true
    }
  },
  watch: {
    users(val) {
      this.data = JSON.parse(JSON.stringify(val))
      this.cacheData = JSON.parse(JSON.stringify(val))
    },
  },
  data() {
    return {
      searchText: "",
      data: [],
      cacheData: [],
      columns: [
        {
          title: "Department",
          dataIndex: "department",
          defaultSortOrder: 'ascend',
          sorter: (a, b) => a.department.localeCompare(b.department),
          scopedSlots: {
            customRender: 'department',
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
          },
          onFilter: (value, record) => record.department.toLowerCase().includes(value.toLowerCase()),
          width: "15%",
        },
        {
          title: "Title",
          dataIndex: "jobtitle",
          sorter: (a, b) => a.title.localeCompare(b.title),
          scopedSlots: {
            customRender: 'jobtitle',
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
          },
          width: "20%",
        },
        {
          title: "Name",
          dataIndex: "name",
          sorter: (a, b) => a.name.localeCompare(b.name),
          scopedSlots: {
            customRender: 'name',
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
          },
          onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
          width: "20%",
        },
        {
          title: "Email",
          dataIndex: "email",
          scopedSlots: {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
          },
          sorter: (a, b) => a.email.localeCompare(b.email),
          onFilter: (value, record) => record.email.toLowerCase().includes(value.toLowerCase()),
          width: "20%",
        },
        {
          title: "Role",
          dataIndex: "role",
          sorter: (a, b) => a.email.localeCompare(b.email),
          width: "8%"
        },
        {
          title: "Actions",
          scopedSlots: { customRender: 'actions' },
          width: "7%"
        },
      ],
      pagination: {
        defaultPageSize: 20,
        showSizeChanger: true,
        pageSizeOptions: ["20", "50", "150", "500"],
        size: "small",
        position: "bottom"
      },
    }
  },
  methods: {
    edit(key) {
      const newData = [...this.data];
      const target = newData.filter(item => key === item.email)[0];
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },
    handleInputChange(value, key, column) {
      const newData = [...this.cacheData];
      const target = newData.filter(item => key === item.email)[0];
      if (target) {
        target[column] = value;
        this.cacheData = newData;
      }
    },
    cancel(key) {
      const newData = [...this.cacheData];
      const target = newData.filter(item => key === item.email)[0]
      const tableData = [...this.data]
      const tableTarget = tableData.filter(item => key === item.email)[0]
      if (target) {
        Object.assign(target, this.data.filter(item => key === item.email)[0])
        delete tableTarget.editable;
        this.cacheData = newData;
        this.data = tableData;
      }
    },
    async save(key) {
      const editData = [...this.cacheData];
      const tableData = [...this.data];
      const target = editData.filter(item => key === item.email)[0];
      const targetTable = tableData.filter(item => key === item.email)[0];
      if (!target.name || !target.department || !target.jobtitle) {
        this.$message.error('Inputs cannot be blank.')
        return
      }
      
      if (target && targetTable) {
        try {
          await updateUser(target)
          delete targetTable.editable;
          this.data = tableData;
          
          Object.assign(targetTable, target);
          this.cacheData = editData;
          this.$message.success("Updated " + target.email + " successfully");
        } catch(err) {
          this.cancel(target.email)
          this.$message.error(err.response.data.error)
        }
      }
    },
    async onDelete(record) {
      try {
        await deleteUser(record)
        var objIndex = this.data.findIndex((user => user.email == record.email))
        this.data.splice(objIndex, 1)
        this.cacheData.splice(objIndex, 1)
        this.$message.success("Deleted " + record.name + " successfully");
      } catch(err) {
        console.error(err)
      }
    },
    handleSearch(selectedKeys, confirm) {
      confirm();
      console.log(selectedKeys)
      this.searchText = selectedKeys[0];
    },
    handleReset(clearFilters) {
      clearFilters();
      this.searchText = '';
    },
  }
}
</script>