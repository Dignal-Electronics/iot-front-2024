import { createRouter, createWebHistory } from 'vue-router'

import Login from '@/views/Login.vue'
import Main from '@/components/layout/Main.vue'
import Users from '@/views/Users/Index.vue'
import Devices from '@/views/Devices/Index.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: Login,
      beforeEnter: (to, from, next) => {
        if (localStorage.token) {
          next('/');
        }
        next();
      },
    },
    {
      path: '/',
      name: 'main',
      component: Main,
      beforeEnter: (to, from, next) => {
        if (!localStorage.token) {
          next('/login');
        }
        next();
      },
      children: [
        { path: '/usuarios', name: 'users', component: Users },
        { path: '/dispositivos', name: 'devices', component: Devices }
      ]
    },

  ]
})

export default router
