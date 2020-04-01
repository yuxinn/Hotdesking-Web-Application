<template>
  <div class="User">
    <p class="h4">User Management</p>
    <div>
      <a-button @click="showAddModal">Add</a-button>
      <AddUser v-if="showAdd" 
        :showAdd="showAdd"
        :add="addUser"
        @close="showAddModal()"
      >
      </AddUser>
    </div>
    <UserTable :users="users" :loading="loading"></UserTable>
  </div>
</template>

<script>
import { getUsers } from '../../api'
import UserTable from './UserTable'
import AddUser from './AddUser'

export default {
  components: {
    AddUser,
    UserTable
  },
  data() {
    return {
      users: [],
      loading: true,
      showAdd: false,
    }
  },
  methods: {
    async getUsers() {
      try {
        this.loading = true
        const resp = await getUsers() 
        this.users = resp
      } catch (err) {
        console.error(err)
      } finally {
        this.loading = false
      }
    },
    showAddModal() {
      this.showAdd = !this.showAdd
    },
    addUser(user) {
      this.users.unshift(user)
    }
  },
  mounted() {
    this.getUsers()
  }
}
</script>