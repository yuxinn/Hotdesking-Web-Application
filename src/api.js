import axios from 'axios'

const base_url = "http://iothotdesk.tk"

export async function getTables() {
  const options = {
    method: 'get',
    url: base_url + '/api/tables'
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