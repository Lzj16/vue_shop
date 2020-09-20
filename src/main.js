import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'

// 导入全局样式表
import '@/assets/css/global.css'

// 导入字体样式
import '@/assets/fonts/iconfont.css'

// 导入NProgress进度条及样式文件
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

import axios from 'axios'

axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
Vue.prototype.$http = axios

// 请求在到达服务器之前，先会调用use中的这个回调函数来添加请求头信息
axios.interceptors.request.use( config => {
  NProgress.start() // 请求时开启进度条
  // 为请求头对象，添加token验证的Authorization字段
  config.headers.Authorization = sessionStorage.getItem('token');
  return config;
})
axios.interceptors.response.use(config => {
  NProgress.done() // 响应时结束进度条
  return config
})

// 全局注册第三方表格组件
import ZkTable from 'vue-table-with-tree-grid'
Vue.component('tree-table',ZkTable)

// 导入富文本编辑器并进行全局注册
import VueQuillEditor from 'vue-quill-editor'
// 导入对应的样式
import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'
Vue.use(VueQuillEditor)

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
