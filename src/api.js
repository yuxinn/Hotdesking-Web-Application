import axios from 'axios'

const base_url = process.env.VUE_APP_API_BASE_URL

export async function getTables() {
  const options = {
    method: 'get',
    url: base_url + '/api/tables'
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