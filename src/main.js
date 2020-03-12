import Vue from 'vue'
import App from './App.vue'
import moment from 'moment'
import axios from 'axios'
import { router } from './router/router.js'

import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

import { ChartPlugin } from "@syncfusion/ej2-vue-charts";
Vue.use(ChartPlugin);
Vue.use(Antd)


Vue.config.productionTip = false
Vue.prototype.moment = moment
Vue.prototype.$http = axios

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
