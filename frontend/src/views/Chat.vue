/**
 * Composant Chat.vue
 * Interface principale de chat avec l'IA Campus France
 * Gère les conversations, les messages et l'interaction utilisateur
 */

<template>
  <div class="min-h-screen flex bg-base-200">
    <!-- Sidebar : Liste des conversations -->
    <aside class="w-72 bg-base-300 text-base-content flex flex-col p-4 border-r border-base-100">
      <!-- En-tête de la sidebar -->
      <div class="mb-6 flex items-center justify-between">
        <span class="text-xl font-bold tracking-wide">Conversations</span>
        <button class="btn btn-sm btn-ghost" @click="goDashboard">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>
      <!-- Liste des conversations -->
      <ul class="flex-1 overflow-y-auto space-y-2">
        <li v-for="conv in conversations" :key="conv.id">
          <button class="btn btn-block btn-ghost justify-start" :class="{ 'bg-primary text-primary-content': conv.id === activeConv }" @click="selectConversation(conv.id)">
            <div class="flex w-full items-center gap-2">
              <!-- Champ d'édition du titre -->
              <input
                v-if="conv.isEditing"
                v-model="conv.title"
                @keyup.enter="renameConversation(conv)"
                @blur="renameConversation(conv)"
                class="input input-sm input-bordered flex-1"
                autofocus
                @click.stop
              />
              <span v-else class="truncate flex-1">{{ conv.title }}</span>
              <button class="btn btn-xs btn-ghost" @click.stop="toggleEdit(conv)">
                <span class="material-icons text-sm">edit</span>
              </button>
            </div>
          </button>
        </li>
      </ul>
      <!-- Bouton nouvelle conversation -->
      <button class="btn btn-block btn-primary mt-4" @click="newConversation">+ Nouvelle conversation</button>
    </aside>

    <!-- Zone principale de chat -->
    <main class="flex-1 flex flex-col h-screen">
      <!-- En-tête avec informations utilisateur -->
      <div class="flex items-center justify-between p-4 border-b border-base-100 bg-base-200">
        <h2 class="text-2xl font-bold">Chat IA Campus France</h2>
        <div class="flex items-center gap-4">
          <span class="text-sm">Tokens restants : {{ tokensRemaining }}</span>
          <button class="btn btn-outline btn-accent" @click="goDashboard">⬅️ Retour au dashboard</button>
        </div>
      </div>

      <!-- Zone des messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-base-200" ref="messagesContainer">
        <!-- Messages de la conversation -->
        <div v-for="msg in messages" :key="msg.id" class="chat" :class="msg.role === 'user' ? 'chat-end' : 'chat-start'">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-base-300 flex items-center justify-center">
              <span v-if="msg.role === 'user'" class="material-icons text-primary">person</span>
              <span v-else class="material-icons text-accent">smart_toy</span>
            </div>
          </div>
          <div class="chat-bubble" :class="msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'">
            {{ msg.content }}
          </div>
        </div>
        <!-- Indicateur de chargement -->
        <div v-if="isLoading" class="chat chat-start">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-base-300 flex items-center justify-center">
              <span class="material-icons text-accent">smart_toy</span>
            </div>
          </div>
          <div class="chat-bubble chat-bubble-accent">
            <span class="loading loading-dots loading-md"></span>
          </div>
        </div>
      </div>

      <!-- Zone de saisie des messages -->
      <form class="p-4 flex gap-2 border-t border-base-100 bg-base-300" @submit.prevent="sendMessage">
        <label class="btn btn-square btn-ghost" title="Joindre un document">
          <span class="material-icons">attach_file</span>
          <input 
            type="file" 
            class="hidden" 
            accept=".pdf,.doc,.docx"
            @change="handleFileUpload"
            :disabled="isLoading"
          />
        </label>
        <input 
          v-model="input" 
          type="text" 
          class="input input-bordered flex-1" 
          placeholder="Pose ta question à l'IA..." 
          :disabled="isLoading || tokensRemaining <= 0"
        />
        <button 
          class="btn btn-primary" 
          type="submit"
          :disabled="isLoading || !input.trim() || tokensRemaining <= 0"
        >
          Envoyer
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
/**
 * Imports des dépendances Vue et des stores
 */
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'

/**
 * Initialisation des variables et stores
 */
const router = useRouter()
const userStore = useUserStore()
const messagesContainer = ref(null)
const conversations = ref([])
const activeConv = ref(null)
const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const tokensRemaining = ref(0)

/**
 * Chargement initial des données
 * - Liste des conversations
 * - Tokens disponibles
 */
onMounted(async () => {
  await loadConversations()
  await loadUserTokens()
})

/**
 * Charge le nombre de tokens restants de l'utilisateur
 * Appelle l'API /api/users/tokens
 */
async function loadUserTokens() {
  try {
    const response = await fetch('/api/users/tokens', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    tokensRemaining.value = data.tokens_remaining
  } catch (error) {
    console.error('Erreur lors du chargement des tokens:', error)
  }
}

/**
 * Charge la liste des conversations de l'utilisateur
 * Appelle l'API /api/chat/conversations
 * Sélectionne automatiquement la première conversation si disponible
 */
async function loadConversations() {
  try {
    const response = await fetch('/api/chat/conversations', {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    conversations.value = data.map(conv => ({ ...conv, isEditing: false }))
    if (data.length > 0) {
      selectConversation(data[0].id)
    }
  } catch (error) {
    console.error('Erreur lors du chargement des conversations:', error)
  }
}

/**
 * Sélectionne une conversation et charge ses messages
 * @param {number} id - ID de la conversation à sélectionner
 */
async function selectConversation(id) {
  activeConv.value = id
  try {
    const response = await fetch(`/api/chat/conversations/${id}/messages`, {
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })
    const data = await response.json()
    messages.value = data
    scrollToBottom()
  } catch (error) {
    console.error('Erreur lors du chargement des messages:', error)
  }
}

/**
 * Crée une nouvelle conversation
 * Appelle l'API POST /api/chat/conversations
 */
async function newConversation() {
  try {
    const response = await fetch('/api/chat/conversations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: 'Nouvelle conversation' })
    })
    const data = await response.json()
    conversations.value.unshift({ ...data, isEditing: false })
    activeConv.value = data.id
    messages.value = []
  } catch (error) {
    console.error('Erreur lors de la création de la conversation:', error)
  }
}

/**
 * Envoie un message à l'IA et gère la réponse
 * Appelle l'API POST /api/chat/messages
 */
async function sendMessage() {
  if (!input.value.trim() || isLoading.value || tokensRemaining.value <= 0) return

  // Si aucune conversation n'est active, on en crée une automatiquement
  if (!activeConv.value) {
    // Générer un titre dynamique (ex : "Discussion du 10/06/2025 14:30")
    const now = new Date();
    const titre = `Discussion du ${now.toLocaleDateString()} ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
    try {
      const response = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userStore.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title: titre })
      })
      const data = await response.json();
      conversations.value.unshift({ ...data, isEditing: false });
      activeConv.value = data.id;
      messages.value = [];
    } catch (error) {
      console.error('Erreur lors de la création automatique de la conversation:', error);
      return;
    }
  }

  const message = input.value
  input.value = ''
  isLoading.value = true

  try {
    const response = await fetch('/api/chat/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation_id: activeConv.value,
        content: message
      })
    })

    const data = await response.json()
    if (response.ok) {
      messages.value.push(
        { role: 'user', content: message },
        { role: 'assistant', content: data.message }
      )
      tokensRemaining.value = data.tokens_remaining
      scrollToBottom()
    } else {
      throw new Error(data.error)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error)
  } finally {
    isLoading.value = false
  }
}

/**
 * Fait défiler la zone de messages vers le bas
 * Utilisé après l'ajout de nouveaux messages
 */
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

/**
 * Active/désactive le mode édition d'une conversation
 * @param {Object} conv - La conversation à éditer
 */
function toggleEdit(conv) {
  conversations.value.forEach(c => (c.isEditing = false))
  conv.isEditing = true
}

/**
 * Renomme une conversation
 * @param {Object} conv - La conversation à renommer
 */
async function renameConversation(conv) {
  if (!conv.title.trim()) {
    conv.title = 'Nouvelle conversation'
  }
  conv.isEditing = false
  try {
    const response = await fetch(`/api/chat/conversations/${conv.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${userStore.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: conv.title })
    })
    if (!response.ok) throw new Error('Erreur de renommage')
  } catch (error) {
    console.error("Erreur lors du renommage :", error)
  }
}

/**
 * Surveille les changements de messages pour le défilement automatique
 */
watch(messages, () => {
  scrollToBottom()
})

/**
 * Navigation vers le dashboard
 */
function goDashboard() {
  router.push('/dashboard')
}

/**
 * Gère l'upload d'un document et son analyse
 * @param {Event} event - Événement de changement de fichier
 */
async function handleFileUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  try {
    isLoading.value = true

    // 1. Upload du document
    const formData = new FormData()
    formData.append('file', file)
    formData.append('file_type', file.name.endsWith('.pdf') ? 'cv' : 'letter')

    const uploadRes = await fetch('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      },
      body: formData
    })

    if (!uploadRes.ok) throw new Error('Erreur lors de l\'upload')
    const { id: documentId } = await uploadRes.json()

    // 2. Ajouter un message utilisateur
    messages.value.push({
      id: Date.now(),
      role: 'user',
      content: `J'ai uploadé un document : ${file.name}`
    })

    // 3. Demander l'analyse
    const analyzeRes = await fetch(`http://localhost:3001/api/documents/${documentId}/analyze`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userStore.token}`
      }
    })

    if (!analyzeRes.ok) throw new Error('Erreur lors de l\'analyse')
    const { analysis } = await analyzeRes.json()

    // 4. Ajouter la réponse de l'IA
    messages.value.push({
      id: Date.now() + 1,
      role: 'assistant',
      content: analysis
    })

    scrollToBottom()
  } catch (error) {
    console.error('Erreur:', error)
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: 'Désolé, une erreur est survenue lors de l\'analyse du document.'
    })
  } finally {
    isLoading.value = false
    event.target.value = '' // Réinitialiser l'input file
  }
}
</script>

<style scoped>
/**
 * Styles pour les icônes Material Icons
 */
.material-icons {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 1;
  letter-spacing: normal;
  text-transform: none;
  display: inline-block;
  white-space: nowrap;
  direction: ltr;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style> 