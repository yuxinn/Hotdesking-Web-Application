import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate';

import beeuser from './user'

Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [createPersistedState({
    paths: ['beeuser']
  })],
  modules: {
    beeuser
  },
  state: {
  },
})