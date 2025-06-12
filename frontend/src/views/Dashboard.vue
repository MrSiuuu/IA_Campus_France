<template>
  <div class="min-h-screen flex bg-[#F5F7FA]">
    <!-- Sidebar -->
    <aside class="w-64 bg-[#1E1E2F] text-white flex flex-col py-8 px-4">
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
    <main class="flex-1 p-10 bg-[#F5F7FA] min-h-screen">
      <div class="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
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
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import DashboardStats from '../components/student/DashboardStats.vue'
import DashboardActions from '../components/student/DashboardActions.vue'
import ProfileCard from '../components/student/ProfileCard.vue'
import EditProfileModal from '../components/student/EditProfileModal.vue'
import ConversationList from '../components/student/ConversationList.vue'

const router = useRouter()
const activeTab = ref('accueil')
const documentsCount = ref(0)
const conversationsCount = ref(0)
const showEditProfileModal = ref(false)

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
  const raw = localStorage.getItem('token')
  if (!raw) return ''
  try {
    if (raw.trim().startsWith('{')) {
      return JSON.parse(raw).access_token
    }
    return raw
  } catch {
    return raw
  }
}

async function fetchProfile() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors de la récupération du profil')
    const data = await response.json()
    profile.value = data
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function fetchConversations() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/conversations', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors de la récupération des conversations')
    const data = await response.json()
    conversations.value = data
    conversationsCount.value = data.length
  } catch (error) {
    console.error('Erreur:', error)
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
    const response = await fetch('http://localhost:3001/api/users/profile', {
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
  router.push('/chat')
}

function handleDeleteConversation(conv) {
  if (!confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
    return;
  }

  fetch(`http://localhost:3001/api/chat/conversations/${conv.id}`, {
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

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  fetchProfile()
  fetchConversations()
})
</script> 