<template>
  <div class="navbar bg-base-100 shadow-lg min-h-[72px] py-4">
    <div class="container mx-auto flex items-center justify-between gap-4 h-full">
      <router-link to="/" class="btn btn-ghost text-xl flex items-center h-full">IA Campus France</router-link>
      <ul class="menu menu-horizontal h-full flex items-center">
        <template v-if="!isAuthenticated">
          <li class="flex items-center h-full">
            <router-link to="/login" class="btn btn-ghost flex items-center h-full">Se connecter</router-link>
          </li>
          <li class="flex items-center h-full">
            <router-link to="/register" class="btn btn-primary flex items-center h-full">Créer un compte</router-link>
          </li>
        </template>
        <template v-else>
          <li class="flex items-center h-full">
            <router-link to="/dashboard" class="btn btn-ghost flex items-center h-full">Dashboard</router-link>
          </li>
          <li class="flex items-center h-full">
            <router-link to="/chat" class="btn btn-ghost flex items-center h-full">
              <span class="material-icons mr-2">chat</span>
              Chat IA
            </router-link>
          </li>
          <li class="flex items-center h-full">
            <button @click="handleLogout" class="btn btn-ghost flex items-center h-full">Se déconnecter</button>
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
import { useUserStore } from '../stores/user'

const auth = useAuthStore()
const userStore = useUserStore()
const { isAuthenticated } = storeToRefs(auth)
const router = useRouter()

const handleLogout = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    if (response.ok) {
      auth.logout()
      userStore.clearUser()
      router.push('/login')
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script> 