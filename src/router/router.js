import Vue from 'vue';
import Router from 'vue-router';

import Login from '../pages/Login/Login'
import Dashboard from '../pages/Dashboard/Dashboard'
import Authentication from '../pages/Login/Authentication'
import User from '../pages/User/User'


Vue.use(Router);

export const router = new Router({
  mode: 'history',
  hash: false,
  routes: [
    { path: '/login', component: Login, name: 'login' },
    { path: '/dashboard', component: Dashboard, name: 'dashboard' },
    { path: '/redirect', component: Authentication, name: 'authentication' },
    { path: '/user', component: User, name: 'user' },
    { path: '/', component: Login, name: "LOGIN" },
    
  ]
});

// router.beforeEach((to, from, next) => {
//   if(to.meta.requiresAuth) {
//     if (store.getters['user/loggedIn']) {
//       next()
//       return
//     }
//     next({ name: 'LOGIN', params: {notification: {message: 'Unauthorized Access.'}} })
//     return
//   }
//   next()
// });