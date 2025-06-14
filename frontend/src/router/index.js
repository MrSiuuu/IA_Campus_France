import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Dashboard from '../views/Dashboard.vue'
import Admin from '../views/Admin.vue'
import Chat from '../views/Chat.vue'
import Contact from '../views/Contact.vue'
import Report from '../views/Report.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/admin',
    name: 'Admin',
    component: Admin
  },
  {
    path: '/chat',
    name: 'Chat',
    component: Chat
  },
  {
    path: '/contact',
    name: 'Contact',
    component: Contact
  },
  {
    path: '/report',
    name: 'Report',
    component: Report
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  try {
    const userStr = localStorage.getItem('user')
    if (!userStr) {
      if (to.path === '/dashboard' || to.path === '/admin' || to.path === '/chat') {
        next('/login')
        return
      }
      next()
      return
    }

    const user = JSON.parse(userStr)
    if (to.path === '/admin' && (!user || user.role !== 'admin')) {
      next('/dashboard')
    } else if (to.path === '/dashboard' && user && user.role === 'admin') {
      next('/admin')
    } else {
      next()
    }
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error)
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    next('/login')
  }
})

export default router 