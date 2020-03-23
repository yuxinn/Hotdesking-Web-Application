const userModule = {
  namespaced: true,
  state: {
    email: '',
    department: '',
    title: '',
    name: '',
    token: '',
  },
  mutations: {
    setEmail(state, email) {
      state.email = email
    },
    setDepartment(state, department) {
      state.department = department
    },
    setTitle(state, title) {
      state.title = title
    },
    setName(state, name) {
      state.name = name
    },
    setToken(state, token) {
      state.token = token
    }
  },
  actions: {
    login({ commit }, user) {
      commit('setEmail', user.email)
      commit('setDepartment', user.department)
      commit('setTitle', user.title)
      commit('setName', user.name)
      commit('setToken', user.token)
    },
    logout({ commit },) {
      commit('setEmail', '')
      commit('setDepartment', '')
      commit('setTitle', '')
      commit('setName', '')
      commit('setToken', '')
    }
  },
  getters: {
    loggedIn: state => {
      return state.token != ''
    }
  }
}

export default userModule