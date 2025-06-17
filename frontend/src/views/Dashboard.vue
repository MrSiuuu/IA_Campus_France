<template>
  <div class="min-h-screen flex flex-col bg-[#F5F7FA] md:flex-row">
    <!-- Sidebar -->
    <aside class="w-64 bg-[#1E1E2F] text-white flex-col py-8 px-4 hidden md:flex">
      <div class="mb-10 flex items-center justify-center">
        <span class="text-2xl font-bold tracking-wide">Espace Étudiant</span>
      </div>
      <nav class="flex-1 space-y-2">
        <button
          v-for="item in navItems"
          :key="item.tab"
          @click="setTab(item.tab)"
          class="flex items-center w-full text-left px-4 py-3 rounded-xl transition-all duration-300 hover:bg-[#2D2D44] hover:translate-x-1"
          :class="{
            'bg-[#2D2D44] text-[#6366F1] font-semibold': activeTab === item.tab,
            'text-gray-300': activeTab !== item.tab
          }"
        >
          <span class="material-icons mr-3 text-xl">{{ item.icon }}</span>
          {{ item.label }}
        </button>
      </nav>
      <button @click="logout" class="mt-10 px-4 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 w-full shadow-lg hover:shadow-xl">
        🔐 Déconnexion
      </button>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-4 md:p-10 bg-[#F5F7FA] pb-24 md:pb-10">
      <div class="max-w-4xl mx-auto py-4 md:py-6 px-2 sm:px-6 lg:px-8">
        <!-- Accueil -->
        <div v-show="activeTab === 'accueil'">
          <h1 class="text-3xl font-bold mb-6 text-[#1F2937]">Bienvenue {{ profile.first_name }} !</h1>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardStats
              :tokens="profile.tokens_remaining"
              :documents-count="documentsCount"
              :conversations-count="conversationsCount"
            />
            <DashboardActions @navigate="handleNavigation" />
          </div>
        </div>

        <!-- Profil -->
        <div v-show="activeTab === 'profil'">
          <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Mon profil</h2>
          <ProfileCard :profile="profile" @edit="handleEditProfile" />
          <EditProfileModal
            v-if="showEditProfileModal"
            :profile="profile"
            @close="showEditProfileModal = false"
            @save="handleSaveProfile"
          />
        </div>

        <!-- Conversations -->
        <div v-show="activeTab === 'conversations'">
          <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Mes conversations</h2>
          <ConversationList
            :conversations="conversations"
            @resume="handleResumeConversation"
            @delete="handleDeleteConversation"
          />
        </div>

        <!-- Onglet Mes tokens -->
        <div v-show="activeTab === 'tokens'">
          <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Mes tokens</h2>
          <TokensPanel 
            :tokens="profile.tokens_remaining" 
            @buy="handleBuyTokens"
            @tokens-updated="handleTokensUpdated"
          />
        </div>
      </div>
    </main>

    <!-- Barre d'onglets mobile en bas -->
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around md:hidden z-50">
      <button v-for="item in navItems" :key="item.tab" @click="setTab(item.tab)" class="flex flex-col items-center py-2 flex-1" :class="activeTab === item.tab ? 'text-indigo-600' : 'text-gray-400'">
        <span class="material-icons">{{ item.icon }}</span>
        <span class="text-xs">{{ item.label }}</span>
      </button>
      <button @click="logout" class="flex flex-col items-center py-2 flex-1 text-red-500">
        <span class="material-icons">logout</span>
        <span class="text-xs">Déconnexion</span>
      </button>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import DashboardStats from '../components/student/DashboardStats.vue'
import DashboardActions from '../components/student/DashboardActions.vue'
import ProfileCard from '../components/student/ProfileCard.vue'
import EditProfileModal from '../components/student/EditProfileModal.vue'
import ConversationList from '../components/student/ConversationList.vue'
import TokensPanel from '../components/student/TokensPanel.vue'
import axios from 'axios'

const router = useRouter()
const activeTab = ref('accueil')
const documentsCount = ref(0)
const conversationsCount = ref(0)
const showEditProfileModal = ref(false)

const apiUrl = import.meta.env.VITE_API_URL

const authStore = useAuthStore()

const navItems = [
  { label: 'Accueil', tab: 'accueil', icon: 'home' },
  { label: 'Parler à l\'IA', tab: 'chat', icon: 'smart_toy' },
  { label: 'Mes tokens', tab: 'tokens', icon: 'confirmation_number' },
  { label: 'Mon profil', tab: 'profil', icon: 'person' },
  { label: 'Mes conversations', tab: 'conversations', icon: 'forum' }
]

const profile = ref({
  first_name: '',
  last_name: '',
  email: '',
  country: '',
  education_level: '',
  tokens_remaining: 0
})

const conversations = ref([])

function getAccessToken() {
  const token = localStorage.getItem('token')
  if (!token) return ''
  
  try {
    const session = typeof token === 'string' ? JSON.parse(token) : token
    return session?.access_token || ''
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error)
    return ''
  }
}

async function fetchProfile() {
  try {
    const response = await axios.get('/users/profile')
    profile.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error)
  }
}

async function fetchConversations() {
  try {
    const response = await axios.get('/chat/conversations')
    conversations.value = response.data
    conversationsCount.value = response.data.length
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error)
  }
}

function setTab(tab) {
  if (tab === 'chat') {
    router.push('/chat')
    return
  }
  activeTab.value = tab
  if (tab === 'conversations') fetchConversations()
  if (tab === 'profil') fetchProfile()
}

function handleNavigation(tab) {
  if (tab === 'chat') {
    router.push('/chat')
  } else {
    setTab(tab)
  }
}

function handleEditProfile() {
  showEditProfileModal.value = true
}

async function handleSaveProfile(newProfile) {
  try {
    const response = await fetch(`${apiUrl}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAccessToken()}`
      },
      body: JSON.stringify(newProfile)
    })
    if (!response.ok) throw new Error('Erreur lors de la mise à jour du profil')
    showEditProfileModal.value = false
    await fetchProfile()
  } catch (error) {
    alert('Erreur lors de la mise à jour du profil')
    console.error(error)
  }
}

function handleResumeConversation(conv) {
  router.push(`/chat?conv=${conv.id}`)
}

function handleDeleteConversation(conv) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
    return;
  }

  fetch(`${apiUrl}/chat/conversations/${conv.id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`
    }
  })
  .then(response => {
    if (!response.ok) throw new Error('Erreur lors de la suppression');
    conversations.value = conversations.value.filter(c => c.id !== conv.id);
    conversationsCount.value--;
  })
  .catch(error => {
    console.error('Erreur:', error);
    alert('Erreur lors de la suppression de la conversation');
  });
}

function handleBuyTokens() {
  // Ici tu peux ouvrir une modale, rediriger vers une page de paiement, etc.
  alert('Fonctionnalité à venir : achat/augmentation de tokens !')
}

function handleTokensUpdated(newBalance) {
  profile.value.tokens_remaining = newBalance
}

async function logout() {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error)
    // En cas d'erreur, on force quand même la déconnexion
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
  }
}

onMounted(async () => {
  await fetchProfile()
  await fetchConversations()
})
</script> 