import axios from 'axios'
import VueJwtDecode from 'vue-jwt-decode'
import store from './store'

const base_url = process.env.VUE_APP_API_BASE_URL
const login_url = process.env.VUE_APP_API_LOGIN_URL

axios.defaults.headers.common['X-NTUCBee-Token'] = store.state.beeuser.token

export async function verifyToken(token) {
  const options = {
    method: 'post',
    url: login_url + ':8000/user/verify',
    data: { token: token },
  }
  let response = await axios(options)
  var user = VueJwtDecode.decode(response.data.token)
  user.token = token

  store.dispatch('beeuser/login', user)
  return user
}

export async function getTables() {
  const options = {
    method: 'get',
    url: base_url + '/api/tables'
  }
  let response = await axios(options)
  return response.data
}

export async function getSensorHealth() {
  const options = {
    method: 'get',
    url: base_url + '/api/tables/health'
  }
  let response = await axios(options)
  return response.data
}

export async function getTableSummary(params) {
  const options = {
    method: 'get',
    params: params,
    url: base_url + '/api/tablesummary'
  }
  let response = await axios(options)
  return response.data
}

export async function createTable(data) {
  const options = {
    method: 'post',
    url: base_url + '/api/table',
    data: data
  }
  let response = await axios(options)
  return response.data
}

export async function bookTable(tableid) {
  const options = {
    method: 'get',
    url: base_url + `/api/table/${tableid}/book`,
  }
  let response = await axios(options)
  return response.data
}