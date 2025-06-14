<template>
  <div class="navbar bg-base-100 shadow-lg min-h-[72px] py-4 relative">
    <div class="container mx-auto flex items-center justify-between gap-4 h-full">
      <router-link to="/" class="btn btn-ghost text-xl flex items-center h-full">IA Campus France</router-link>
      <!-- Menu burger mobile -->
      <button class="md:hidden btn btn-ghost" @click="openDrawer">
        <span class="material-icons">menu</span>
      </button>
      <!-- Menu horizontal desktop -->
      <ul class="menu menu-horizontal h-full flex items-center hidden md:flex">
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
    <!-- Drawer mobile -->
    <transition name="fade">
      <div v-if="drawerOpen" class="fixed inset-0 z-50 flex">
        <div class="fixed inset-0 bg-black bg-opacity-40" @click="closeDrawer"></div>
        <nav class="relative bg-base-100 w-64 max-w-[80vw] h-full shadow-lg flex flex-col p-6 animate-slidein">
          <button class="absolute top-4 right-4 btn btn-ghost" @click="closeDrawer">
            <span class="material-icons">close</span>
          </button>
          <ul class="flex flex-col gap-4 mt-12">
            <template v-if="!isAuthenticated">
              <li>
                <router-link to="/login" class="btn btn-ghost w-full" @click="closeDrawer">Se connecter</router-link>
              </li>
              <li>
                <router-link to="/register" class="btn btn-primary w-full" @click="closeDrawer">Créer un compte</router-link>
              </li>
            </template>
            <template v-else>
              <li>
                <router-link to="/dashboard" class="btn btn-ghost w-full" @click="closeDrawer">Dashboard</router-link>
              </li>
              <li>
                <router-link to="/chat" class="btn btn-ghost w-full" @click="closeDrawer">
                  <span class="material-icons mr-2">chat</span>
                  Chat IA
                </router-link>
              </li>
              <li>
                <button @click="handleLogout; closeDrawer()" class="btn btn-ghost w-full">Se déconnecter</button>
              </li>
            </template>
          </ul>
        </nav>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

const auth = useAuthStore()
const userStore = useUserStore()
const { isAuthenticated } = storeToRefs(auth)
const router = useRouter()
const drawerOpen = ref(false)

function openDrawer() {
  drawerOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeDrawer() {
  drawerOpen.value = false
  document.body.style.overflow = ''
}

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

// Fermer drawer si on passe en desktop
watch(
  () => window.innerWidth,
  () => {
    if (window.innerWidth >= 768) closeDrawer()
  }
)
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
@keyframes slidein {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
.animate-slidein {
  animation: slidein 0.3s cubic-bezier(.4,0,.2,1);
}
</style> 