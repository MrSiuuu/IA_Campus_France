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

          <!-- Recommandations -->
          <div v-show="activeTab === 'recommandations'">
            <h2 class="text-2xl font-bold mb-6 text-[#1F2937]">Recommandations / Messages de contact</h2>
            <table class="min-w-full bg-white rounded-lg shadow overflow-hidden">
              <thead>
                <tr>
                  <th class="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                  <th class="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th class="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase">Message</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="rec in recommandations" :key="rec.id">
                  <td class="px-6 py-4 border-b text-gray-900">{{ rec.name }}</td>
                  <td class="px-6 py-4 border-b text-gray-900">{{ rec.email }}</td>
                  <td class="px-6 py-4 border-b text-gray-900">{{ rec.message }}</td>
                </tr>
                <tr v-if="recommandations.length === 0">
                  <td colspan="3" class="px-6 py-4 text-center text-gray-400">Aucune recommandation pour le moment.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Codes Promo -->
          <div v-show="activeTab === 'promo'">
            <PromoCodes />
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
import KnowledgeBase from '../components/admin/KnowledgeBase.vue'
import ChatLogs from '../components/admin/ChatLogs.vue'
import PromoCodes from '../components/admin/PromoCodes.vue'
import { useAuthStore } from '../stores/auth'
import axios from '../config/axios'

const router = useRouter()
const activeTab = ref('accueil')
const authStore = useAuthStore()

const stats = ref({
  studentsCount: 0,
  messagesCount: 0,
  tokensConsumed: 0,
  sharedDocumentsCount: 0
})

const users = ref([])
const knowledgeDocuments = ref([])
const chats = ref([])
const recommandations = ref([])
const loading = ref(false)
const error = ref(null)

async function fetchStats() {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/admin/stats')
    stats.value = {
      studentsCount: response.data.totalStudents,
      messagesCount: response.data.totalMessages,
      tokensConsumed: response.data.totalTokens,
      sharedDocumentsCount: response.data.sharedDocuments,
      monthlyStudents: response.data.monthlyStudents,
      messagesByDay: response.data.messagesByDay,
      documentTypes: response.data.documentTypes,
      userActivity: response.data.userActivity,
      tokenDistribution: response.data.tokenDistribution
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error)
    if (error.response?.status === 403) {
      router.push('/login')
      return
    }
    error.value = error.message
  } finally {
    loading.value = false
  }
}

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/admin/users')
    users.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    if (error.response?.status === 403) {
      router.push('/login')
      return
    }
    error.value = error.message
  } finally {
    loading.value = false
  }
}

async function fetchKnowledgeDocuments() {
  try {
    const response = await axios.get('/admin/knowledge-documents')
    knowledgeDocuments.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des documents:', error)
  }
}

async function fetchChats() {
  try {
    const response = await axios.get('/admin/chats')
    chats.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des conversations:', error)
  }
}

async function fetchRecommendations() {
  loading.value = true
  error.value = null
  try {
    const response = await axios.get('/admin/recommandations')
    recommandations.value = response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des recommandations:', error)
    error.value = error.message
  } finally {
    loading.value = false
  }
}

function setTab(tab) {
  activeTab.value = tab
  error.value = null
  if (tab === 'accueil') fetchStats()
  else if (tab === 'users') fetchUsers()
  else if (tab === 'knowledge') fetchKnowledgeDocuments()
  else if (tab === 'chats') fetchChats()
  else if (tab === 'recommandations') fetchRecommendations()
}

function handleEditUser(user) {
  // TODO: Implémenter la modification d'un utilisateur
  console.log('Modifier utilisateur:', user)
}

function handleDeleteUser(user) {
  // TODO: Implémenter la suppression d'un utilisateur
  console.log('Supprimer utilisateur:', user)
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

// Chargement initial des données
onMounted(async () => {
  await fetchStats()
  await fetchUsers()
  await fetchKnowledgeDocuments()
  await fetchChats()
  await fetchRecommendations()
})
</script> 