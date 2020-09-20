import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '@/views/login/Login'
import Home from '@/views/home/Home'
import Welcome from '@/views/home/Welcome'
import Users from '@/views/users/Users'
import Roles from '@/views/power/Roles'
import Rights from '@/views/power/Rights'
import Goods from '@/views/commodity/Goods'
import Add from '@/views/commodity/components/Add'
import Params from '@/views/commodity/Params'
import Categories from '@/views/commodity/Categories'
import Orders from '@/views/order/Orders'
import Reports from '@/views/statistics/Reports'


Vue.use(VueRouter)

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [
      { path: '/welcome', component: Welcome },
      {path: '/users', component: Users},
      {path: '/roles', component: Roles},
      {path: '/rights', component: Rights},
      {path: '/goods', component: Goods},
      {path: '/goods/add', component: Add},
      {path: '/params', component: Params},
      {path: '/categories', component: Categories},
      {path: '/orders', component: Orders},
      {path: '/reports', component: Reports},
    ]
  },
]

const router = new VueRouter({
  routes
})

// 配置路由守卫
router.beforeEach((to, from, next) => {
  // 访问登录页面，放行
  if (to.path === '/login') {
    return next();
  }
  // 如果用户未登录，返回登录页面
  const token = sessionStorage.getItem('token');
  if (!token) {
    return next('/login');
  }
  // 如果用户已登录，放行
  return next();
})

export default router
