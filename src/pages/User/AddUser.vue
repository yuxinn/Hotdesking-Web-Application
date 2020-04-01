<template>
  <a-modal title="Add Table" v-model="visible" @cancel="handleClose" @ok="handleAdd" okText="Add">
    <a-form :model="form">
      <a-form-item label="Department" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-input v-model="form.department" placeholder="Finance" />
      </a-form-item>
      <a-form-item label="Job Title" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-input v-model="form.jobtitle" placeholder="Finance Manager" />
      </a-form-item>
      <a-form-item label="Name" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-input v-model="form.name" placeholder="Beezy Bee" />
      </a-form-item>
      <a-form-item label="Email" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-input v-model="form.email" placeholder="beezybee@nedigital.sg" />
      </a-form-item>
      <a-form-item label="Role" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
        <a-radio-group v-model="form.role">
          <a-radio value="admin">Admin</a-radio>
          <a-radio value="manager">Manager</a-radio>
        </a-radio-group>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script>
import { addUser } from '../../api'

export default {
  props: {
    showAdd: Boolean,
    add: Function
  },
  data() {
    return {
      visible: this.showAdd,
      form: {
        department: '',
        jobtitle: '',
        name: '',
        email: '',
        role: 'admin'
      }
    }
  },
  methods: {
    handleClose() {
      this.$emit('close')
    },
    async handleAdd() {
      try {
        await addUser(this.form)
        this.add(this.form)
        this.$message.success("Add user " + this.form.email + " successful");
        this.handleClose()
      } catch(err) {
        console.error(err)
      }
    }
  }
}
</script>