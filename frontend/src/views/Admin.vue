<template>
  <div class="min-h-screen flex bg-gray-100">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 text-gray-100 flex flex-col py-8 px-4">
      <div class="mb-10 flex items-center justify-center">
        <span class="text-2xl font-bold tracking-wide">Admin LPDG</span>
      </div>
      <nav class="flex-1 space-y-2">
        <button
          v-for="item in navItems"
          :key="item.tab"
          @click="setTab(item.tab)"
          class="block w-full text-left px-4 py-3 rounded transition-colors duration-150 hover:bg-gray-800 hover:text-white"
          :class="{
            'bg-gray-800 text-indigo-400 font-semibold': activeTab === item.tab,
            'text-gray-200': activeTab !== item.tab
          }"
        >
          {{ item.label }}
        </button>
      </nav>
      <button @click="logout" class="mt-10 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 w-full">Se déconnecter</button>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-10 bg-gray-50 min-h-screen">
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div v-show="activeTab === 'dashboard'">
          <h1 class="text-3xl font-bold mb-6 text-gray-800">Bienvenue sur le dashboard administrateur</h1>
          <p class="mb-8 text-gray-700">Vous êtes connecté en tant qu'<strong>admin</strong>.</p>
        </div>
        <div v-show="activeTab === 'utilisateurs'">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Liste des utilisateurs</h2>
          <div v-if="usersLoading" class="text-gray-500">Chargement...</div>
          <div v-else>
            <table class="min-w-full bg-white rounded shadow">
              <thead>
                <tr>
                  <th class="px-4 py-2 text-left text-gray-700 font-bold">Nom</th>
                  <th class="px-4 py-2 text-left text-gray-700 font-bold">Email</th>
                  <th class="px-4 py-2 text-left text-gray-700 font-bold">Rôle</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-t">
                  <td class="px-4 py-2 text-gray-800">{{ user.first_name || user.nom }}</td>
                  <td class="px-4 py-2 text-gray-800">{{ user.email }}</td>
                  <td class="px-4 py-2 text-gray-800">{{ user.role }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div v-show="activeTab === 'profil'">
          <h2 class="text-2xl font-bold mb-6 text-gray-800">Mon profil</h2>
          <div class="bg-white shadow rounded-lg p-6 flex items-center">
            <img :src="profile.photo || 'https://via.placeholder.com/150'" alt="Avatar" class="h-16 w-16 rounded-full" />
            <div class="ml-4">
              <h3 class="text-lg leading-6 font-medium text-gray-900">{{ profile.nom || 'Admin' }}</h3>
              <p class="text-sm text-gray-500">{{ profile.email }}</p>
              <span class="text-xs text-indigo-600 font-semibold">{{ profile.role }}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const navItems = [
  { label: 'Accueil', tab: 'dashboard' },
  { label: 'Utilisateurs', tab: 'utilisateurs' },
  { label: 'Profil', tab: 'profil' }
]
const activeTab = ref('dashboard')
const users = ref([])
const usersLoading = ref(false)
const profile = ref({ nom: 'Admin', email: 'admin@email.com', role: 'admin' })

function setTab(tab) {
  activeTab.value = tab
  if (tab === 'utilisateurs') fetchUsers()
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

async function fetchUsers() {
  usersLoading.value = true
  const res = await fetch('http://localhost:3001/api/auth/users', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
  })
  users.value = await res.json()
  usersLoading.value = false
}

onMounted(() => {
  // Charger le profil admin (à adapter si tu veux charger dynamiquement)
  // fetchProfile()
})
</script> 