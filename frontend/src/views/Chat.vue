/**
 * Composant Chat.vue
 * Interface principale de chat avec l'IA Campus France
 * Gère les conversations, les messages et l'interaction utilisateur
 */

<template>
  <div class="min-h-screen flex bg-base-200">
    <!-- Sidebar : Liste des conversations -->
    <aside
      class="w-72 bg-base-300 text-base-content flex flex-col p-4 border-r border-base-100
      max-md:fixed max-md:top-0 max-md:left-0 max-md:h-full max-md:z-40 max-md:shadow-lg max-md:transition-transform max-md:duration-300
      max-md:translate-x-[-100%]"
      :class="{ 'max-md:translate-x-0': sidebarOpen }"
      v-show="!isMobile || sidebarOpen"
    >
      <!-- En-tête de la sidebar -->
      <div class="mb-6 flex items-center justify-between">
        <span class="text-xl font-bold tracking-wide">Conversations</span>
        <button class="btn btn-sm btn-ghost" @click="closeSidebar" v-if="isMobile">
          <span class="material-icons">close</span>
        </button>
        <button class="btn btn-sm btn-ghost" @click="goDashboard" v-else>
          <span class="material-icons">arrow_back</span>
        </button>
      </div>
      <!-- Liste des conversations -->
      <ul class="flex-1 overflow-y-auto space-y-2">
        <li v-for="conv in conversations" :key="conv.id">
          <button class="btn btn-block btn-ghost justify-start" :class="{ 'bg-primary text-primary-content': conv.id === activeConv }" @click="selectConversation(conv.id); closeSidebar()">
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
    <main class="flex-1 flex flex-col h-screen relative">
      <!-- En-tête avec informations utilisateur -->
      <div class="flex items-center justify-between p-4 border-b border-base-100 bg-base-200">
        <div class="flex items-center gap-2">
          <button class="btn btn-ghost btn-sm md:hidden" @click="openSidebar">
            <span class="material-icons">menu</span>
          </button>
          <h2 class="text-2xl font-bold">Chat IA Campus France</h2>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-sm">Tokens restants : {{ tokensRemaining }}</span>
          <button class="btn btn-outline btn-accent max-md:hidden" @click="goDashboard">⬅️ Retour au dashboard</button>
        </div>
      </div>

      <!-- Zone des messages -->
      <div class="flex-1 overflow-y-auto p-2 md:p-6 space-y-2 md:space-y-4 bg-base-200" ref="messagesContainer">
        <!-- Messages de la conversation -->
        <div v-for="msg in messages" :key="msg.id" class="chat" :class="msg.role === 'user' ? 'chat-end' : 'chat-start'">
          <div class="chat-image avatar">
            <div class="w-10 rounded-full bg-base-300 flex items-center justify-center">
              <span v-if="msg.role === 'user'" class="material-icons text-primary">person</span>
              <span v-else class="material-icons text-accent">smart_toy</span>
            </div>
          </div>
          <div class="chat-bubble text-sm md:text-base" :class="msg.role === 'user' ? 'chat-bubble-primary' : 'chat-bubble-accent'">
            <div v-if="msg.role === 'user'">{{ msg.content }}</div>
            <div v-else v-html="renderMarkdown(msg.content)"></div>
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
      <form class="p-2 md:p-4 flex gap-2 border-t border-base-100 bg-base-300" @submit.prevent="sendMessage">
        <div class="flex-1 relative">
          <textarea 
            v-model="input" 
            class="textarea textarea-bordered w-full text-base md:text-lg" 
            placeholder="Pose ta question à l'IA..." 
            :disabled="isLoading || tokensRemaining < 10"
            rows="1"
            @keydown.enter.exact.prevent="sendMessage"
            @keydown.enter.shift.exact.prevent="input += '\n'"
            ref="textareaInput"
            @input="adjustTextareaHeight"
            style="resize: none; min-height: 2.5rem; overflow-y: hidden;"
          ></textarea>
        </div>
        <button 
          class="btn btn-primary text-base md:text-lg px-4 md:px-8 py-2 md:py-3" 
          type="submit"
          :disabled="isLoading || !input.trim() || tokensRemaining < 10"
        >
          Envoyer
        </button>
      </form>
      <div v-if="tokensRemaining > 0 && tokensRemaining < 10" class="p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 mt-2 flex items-center justify-between">
        <span>Il vous reste moins de 10 tokens, vous ne pouvez plus envoyer de message à l'IA.</span>
        <button class="ml-4 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] font-semibold" @click="goBuyTokens">Augmenter mes tokens</button>
      </div>
      <div v-else-if="tokensRemaining <= 0" class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mt-2 flex items-center justify-between">
        <span>Vous n'avez plus de tokens. Veuillez augmenter votre solde pour continuer à discuter avec l'IA.</span>
        <button class="ml-4 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] font-semibold" @click="goBuyTokens">Augmenter mes tokens</button>
      </div>
    </main>

    <!-- Modale de création de conversation -->
    <div v-if="showCreateModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div class="bg-white rounded-lg shadow-lg p-4 sm:p-6 w-11/12 max-w-sm mx-auto">
        <h3 class="text-lg sm:text-xl font-bold mb-4 text-black">Nouvelle conversation</h3>
        <input v-model="newConvTitle" type="text" class="input input-bordered w-full mb-2 text-black placeholder-gray-500 text-base sm:text-lg" placeholder="Nom de la conversation" @keyup.enter="confirmCreateConversation" autofocus />
        <div v-if="createError" class="text-red-600 text-sm mb-2 flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {{ createError }}
        </div>
        <div class="flex flex-col sm:flex-row justify-end gap-2 mt-2">
          <button class="btn btn-ghost text-black w-full sm:w-auto" @click="cancelCreateConversation">Annuler</button>
          <button class="btn btn-primary w-full sm:w-auto" @click="confirmCreateConversation">Créer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Imports des dépendances Vue et des stores
 */
import { ref, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { marked } from 'marked'

/**
 * Initialisation des variables et stores
 */
const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const authStore = useAuthStore()
const messagesContainer = ref(null)
const conversations = ref([])
const activeConv = ref(null)
const messages = ref([])
const input = ref('')
const isLoading = ref(false)
const tokensRemaining = ref(0)
const textareaInput = ref(null)
const sidebarOpen = ref(false)
const isMobile = ref(false)
const showCreateModal = ref(false)
const newConvTitle = ref('')
const createError = ref('')

/**
 * Chargement initial des données
 * - Liste des conversations
 * - Tokens disponibles
 */
onMounted(async () => {
  await loadConversations()
  await loadUserTokens()
  adjustTextareaHeight()
  checkMobile()
  window.addEventListener('resize', checkMobile)

  // Sélection automatique de la conversation si paramètre conv présent
  const convId = route.query.conv
  if (convId && conversations.value.length > 0) {
    const found = conversations.value.find(c => String(c.id) === String(convId))
    if (found) {
      selectConversation(found.id)
    }
  }
})

/**
 * Charge le nombre de tokens restants de l'utilisateur
 * Appelle l'API /api/users/tokens
 */
async function loadUserTokens() {
  try {
    const response = await fetch(`${API_URL}/users/tokens`, {
      headers: {
        'Authorization': `Bearer ${authStore.session?.access_token}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors du chargement des tokens')
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
    const response = await fetch(`${API_URL}/chat/conversations`, {
      headers: {
        'Authorization': `Bearer ${authStore.session?.access_token}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors du chargement des conversations')
    const data = await response.json()
    conversations.value = data.map(conv => ({ ...conv, isEditing: false }))
    // Suppression de la sélection automatique ici
    // if (data.length > 0) {
    //   selectConversation(data[0].id)
    // }
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
    const response = await fetch(`${API_URL}/chat/conversations/${id}/messages`, {
      headers: {
        'Authorization': `Bearer ${authStore.session?.access_token}`
      }
    })
    if (!response.ok) throw new Error('Erreur lors du chargement des messages')
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
  showCreateModal.value = true
  newConvTitle.value = ''
  createError.value = ''
}

async function confirmCreateConversation() {
  if (!newConvTitle.value.trim()) {
    createError.value = 'Veuillez entrer un nom de conversation.'
    return
  }
  try {
    const response = await fetch(`${API_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.session?.access_token}`
      },
      body: JSON.stringify({ title: newConvTitle.value })
    });
    if (!response.ok) throw new Error('Erreur lors de la création de la conversation');
    const data = await response.json();
    conversations.value.unshift({ ...data, isEditing: false });
    activeConv.value = data.id;
    messages.value = [];
    showCreateModal.value = false
    newConvTitle.value = ''
    createError.value = ''
  } catch (error) {
    createError.value = error.message || 'Erreur lors de la création de la conversation.'
  }
}

function cancelCreateConversation() {
  showCreateModal.value = false
  newConvTitle.value = ''
  createError.value = ''
}

/**
 * Envoie un message à l'IA et gère la réponse
 * Appelle l'API POST /api/chat/messages
 */
async function sendMessage() {
  if (!input.value.trim() || isLoading.value || tokensRemaining.value <= 0) return;

  // Si aucune conversation n'est active, on en crée une
  if (!activeConv.value) {
    await newConversation();
    if (!activeConv.value) return; // Si la création a échoué
  }

  const message = input.value;
  input.value = '';
  isLoading.value = true;

  // Ajouter immédiatement le message de l'utilisateur
  messages.value.push({ role: 'user', content: message });
  scrollToBottom();

  try {
    console.log('Envoi du message:', {
      conversation_id: activeConv.value,
      content: message
    });

    const response = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.session?.access_token}`
      },
      body: JSON.stringify({
        conversation_id: activeConv.value,
        content: message
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de l\'envoi du message');
    }
    
    const data = await response.json();
    console.log('Réponse reçue:', data);

    // Ajouter seulement la réponse de l'assistant
    messages.value.push({ role: 'assistant', content: data.message });
    tokensRemaining.value = data.tokens_remaining;
    scrollToBottom();
  } catch (error) {
    console.error('Erreur lors de l\'envoi du message:', error);
    input.value = message; // Restaurer le message en cas d'erreur
    alert(error.message); // Afficher l'erreur à l'utilisateur
  } finally {
    isLoading.value = false;
  }

  nextTick(() => {
    if (textareaInput.value) {
      textareaInput.value.style.height = '2.5rem'
    }
  })
}

/**
 * Fait défiler la zone de messages vers le bas
 * Utilisé après l'ajout de nouveaux messages
 */
async function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
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

function renderMarkdown(text) {
  return marked.parse(text || '')
}

// Ajuster automatiquement la hauteur du textarea
function adjustTextareaHeight() {
  const textarea = textareaInput.value
  if (textarea) {
    textarea.style.height = '0'
    const scrollHeight = textarea.scrollHeight
    textarea.style.height = Math.min(scrollHeight, 200) + 'px' // Maximum 200px
  }
}

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}
function openSidebar() {
  sidebarOpen.value = true
}
function closeSidebar() {
  sidebarOpen.value = false
}

function goBuyTokens() {
  // Redirige vers l'onglet tokens du dashboard
  router.push('/dashboard?tab=tokens')
}

const API_URL = import.meta.env.VITE_API_URL
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