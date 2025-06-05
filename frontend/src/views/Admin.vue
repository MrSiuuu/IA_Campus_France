<template>
  <div class="min-h-screen flex bg-[#F5F7FA]">
    <AdminSidebar
      :active-tab="activeTab"
      @change-tab="setTab"
      @logout="logout"
    />

    <!-- Main content -->
    <main class="flex-1 p-10 bg-[#F5F7FA] min-h-screen">
      <div class="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Message d'erreur -->
        <div v-if="error" class="mb-6 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span class="block sm:inline">{{ error }}</span>
        </div>

        <!-- Loading spinner -->
        <div v-if="loading" class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-[#6366F1]"></div>
        </div>

        <!-- Contenu -->
        <div v-else>
          <!-- Accueil -->
          <div v-show="activeTab === 'accueil'">
            <h1 class="text-3xl font-bold mb-6 text-[#1F2937]">Tableau de bord administrateur</h1>
            <AdminStats :stats="stats" />
          </div>

          <!-- Utilisateurs -->
          <div v-show="activeTab === 'users'">
            <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Gestion des utilisateurs</h2>
            <UserList
              :users="users"
              @edit="handleEditUser"
              @delete="handleDeleteUser"
            />
          </div>

          <!-- Documents partagés -->
          <div v-show="activeTab === 'documents'">
            <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Documents partagés</h2>
            <SharedDocuments
              :documents="sharedDocuments"
              @add="handleAddSharedDocument"
              @view="handleViewSharedDocument"
              @edit="handleEditSharedDocument"
              @delete="handleDeleteSharedDocument"
            />
          </div>

          <!-- Base de connaissances -->
          <div v-show="activeTab === 'knowledge'">
            <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Base de connaissances IA</h2>
            <KnowledgeBase
              :documents="knowledgeDocuments"
              @add="handleAddKnowledgeDocument"
              @view="handleViewKnowledgeDocument"
              @edit="handleEditKnowledgeDocument"
              @delete="handleDeleteKnowledgeDocument"
            />
          </div>

          <!-- Logs des conversations -->
          <div v-show="activeTab === 'chats'">
            <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Logs des conversations</h2>
            <ChatLogs
              :chats="chats"
              @view="handleViewChat"
            />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import AdminStats from '../components/admin/AdminStats.vue'
import UserList from '../components/admin/UserList.vue'
import SharedDocuments from '../components/admin/SharedDocuments.vue'
import KnowledgeBase from '../components/admin/KnowledgeBase.vue'
import ChatLogs from '../components/admin/ChatLogs.vue'

const router = useRouter()
const activeTab = ref('accueil')

const stats = ref({
  studentsCount: 0,
  messagesCount: 0,
  tokensConsumed: 0,
  sharedDocumentsCount: 0
})

const users = ref([])
const sharedDocuments = ref([])
const knowledgeDocuments = ref([])
const chats = ref([])
const loading = ref(false)
const error = ref(null)

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

async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:3001/api/admin/stats', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) {
      if (response.status === 403) {
        router.push('/login')
        return
      }
      throw new Error('Erreur lors de la récupération des statistiques')
    }
    stats.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
    error.value = error.message
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch('http://localhost:3001/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) {
      if (response.status === 403) {
        router.push('/login')
        return
      }
      throw new Error('Erreur lors de la récupération des utilisateurs')
    }
    users.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
    error.value = error.message
  } finally {
    loading.value = false
  }
}

async function fetchSharedDocuments() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/shared-documents', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors de la récupération des documents partagés')
    sharedDocuments.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function fetchKnowledgeDocuments() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/knowledge-documents', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors de la récupération des documents de la base de connaissances')
    knowledgeDocuments.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

async function fetchChats() {
  try {
    const response = await fetch('http://localhost:3001/api/admin/chats', {
      headers: {
        'Authorization': `Bearer ${getAccessToken()}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors de la récupération des conversations')
    chats.value = await response.json()
  } catch (error) {
    console.error('Erreur:', error)
  }
}

function setTab(tab) {
  activeTab.value = tab
  error.value = null
  if (tab === 'accueil') fetchStats()
  if (tab === 'users') fetchUsers()
  if (tab === 'documents') fetchSharedDocuments()
  if (tab === 'knowledge') fetchKnowledgeDocuments()
  if (tab === 'chats') fetchChats()
}

function handleEditUser(user) {
  // TODO: Implémenter la modification d'un utilisateur
  console.log('Modifier utilisateur:', user)
}

function handleDeleteUser(user) {
  // TODO: Implémenter la suppression d'un utilisateur
  console.log('Supprimer utilisateur:', user)
}

function handleAddSharedDocument() {
  // TODO: Implémenter l'ajout d'un document partagé
  console.log('Ajouter un document partagé')
}

function handleViewSharedDocument(doc) {
  // TODO: Implémenter la visualisation d'un document partagé
  console.log('Voir document partagé:', doc)
}

function handleEditSharedDocument(doc) {
  // TODO: Implémenter la modification d'un document partagé
  console.log('Modifier document partagé:', doc)
}

function handleDeleteSharedDocument(doc) {
  // TODO: Implémenter la suppression d'un document partagé
  console.log('Supprimer document partagé:', doc)
}

function handleAddKnowledgeDocument() {
  // TODO: Implémenter l'ajout d'un document de la base de connaissances
  console.log('Ajouter un document de la base de connaissances')
}

function handleViewKnowledgeDocument(doc) {
  // TODO: Implémenter la visualisation d'un document de la base de connaissances
  console.log('Voir document de la base de connaissances:', doc)
}

function handleEditKnowledgeDocument(doc) {
  // TODO: Implémenter la modification d'un document de la base de connaissances
  console.log('Modifier document de la base de connaissances:', doc)
}

function handleDeleteKnowledgeDocument(doc) {
  // TODO: Implémenter la suppression d'un document de la base de connaissances
  console.log('Supprimer document de la base de connaissances:', doc)
}

function handleViewChat(chat) {
  // TODO: Implémenter la visualisation détaillée d'une conversation
  console.log('Voir conversation:', chat)
}

function logout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}

onMounted(() => {
  fetchStats()
})
</script> 