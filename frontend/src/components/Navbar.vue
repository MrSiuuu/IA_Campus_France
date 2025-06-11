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
            <router-link to="/chat" class="btn btn-ghost">
              <span class="material-icons mr-2">chat</span>
              Chat IA
            </router-link>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const router = useRouter()
const userStore = useUserStore()
const isAuthenticated = ref(false)

onMounted(() => {
  // Vérifier si l'utilisateur est connecté
  isAuthenticated.value = !!userStore.token
})

const handleLogout = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    if (response.ok) {
      userStore.clearUser()
      isAuthenticated.value = false
      router.push('/login')
    }
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
  }
}
</script> 