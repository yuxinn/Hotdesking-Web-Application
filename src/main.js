import Vue from 'vue'
import App from './App.vue'
import moment from 'moment'
import store from './store'
import axios from 'axios'
import { router } from './router/router.js'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

Vue.use(Antd)


Vue.config.productionTip = false
Vue.prototype.moment = moment
Vue.prototype.$http = axios

if (process.env.NODE_ENV === 'production') {
  Vue.config.devtools = false;
  Vue.config.debug = false;
  Vue.config.silent = true; 
}

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')
