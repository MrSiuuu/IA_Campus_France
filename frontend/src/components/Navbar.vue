<template>
  <div class="navbar bg-base-100 shadow-lg">
    <div class="container mx-auto flex items-center justify-between gap-4">
      <router-link to="/" class="btn btn-ghost text-xl">IA Campus France</router-link>
      <ul class="menu menu-horizontal">
        <template v-if="!isAuthenticated">
          <li>
            <router-link to="/login" class="btn btn-ghost">Se connecter</router-link>
          </li>
          <li>
            <router-link to="/register" class="btn btn-primary">Créer un compte</router-link>
          </li>
        </template>
        <template v-else>
          <li>
            <router-link to="/dashboard" class="btn btn-ghost">Dashboard</router-link>
          </li>
          <li>
            <button @click="handleLogout" class="btn btn-ghost">Se déconnecter</button>
          </li>
        </template>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const { isAuthenticated } = storeToRefs(auth)
const router = useRouter()

const handleLogout = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.ok) {
      auth.logout()
      router.push('/login')
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script> 