<template>
  <div class="min-h-screen flex bg-base-200 relative">
    <!-- Overlay pour mobile -->
    <div 
      v-show="isMobile && sidebarOpen" 
      class="fixed inset-0 bg-black/50 z-30 pointer-events-auto"
      @click="closeSidebar"
    ></div>

    <!-- Sidebar : Liste des conversations -->
    <aside
      class="w-72 bg-base-300 text-base-content flex flex-col p-4 border-r border-base-100
      max-md:fixed max-md:top-0 max-md:left-0 max-md:h-screen max-md:w-[80%] max-md:z-40 
      max-md:shadow-lg max-md:transition-all max-md:duration-300 max-md:ease-in-out pointer-events-auto"
      :class="{ 'max-md:translate-x-0': sidebarOpen, 'max-md:translate-x-[-100%]': !sidebarOpen }"
      @click.stop
    >
      <!-- En-tête de la sidebar -->
      <div class="mb-6 flex items-center justify-between">
        <span class="text-xl font-bold tracking-wide">Conversations</span>
        <button class="btn btn-sm btn-ghost md:hidden" @click.stop="closeSidebar">
          <span class="material-icons">close</span>
        </button>
      </div>

      <!-- Liste des conversations -->
      <ul class="flex-1 overflow-y-auto space-y-2">
        <li v-for="conv in conversations" :key="conv.id" class="w-full">
          <button 
            class="btn btn-block btn-ghost justify-start w-full flex items-center gap-2" 
            @click.stop="handleConversationClick(conv.id)"
          >
            <div class="flex w-full items-center gap-2">
              <input
                v-if="conv.isEditing"
                v-model="conv.title"
                @keyup.enter.stop="handleRename(conv)"
                @blur.stop="handleRename(conv)"
                class="input input-sm input-bordered flex-1"
                placeholder="Nom de la conversation"
                ref="editInput"
                @click.stop
              />
              <span v-else class="truncate flex-1">{{ conv.title }}</span>
              <button 
                class="btn btn-xs btn-ghost" 
                @click.stop="startEdit(conv)"
              >
                <span class="material-icons text-sm">edit</span>
              </button>
            </div>
          </button>
        </li>
      </ul>

      <!-- Bouton nouvelle conversation -->
      <button 
        class="btn btn-block btn-primary mt-4 w-full" 
        @click.stop="handleNewConversation"
      >
        + Nouvelle conversation
      </button>
    </aside>

    <!-- Zone principale de chat -->
    <main class="flex-1 flex flex-col h-screen relative">
      <!-- En-tête avec informations utilisateur -->
      <div class="flex items-center justify-between p-4 border-b border-base-100 bg-base-200">
        <div class="flex items-center gap-2">
          <button 
            class="btn btn-ghost btn-sm md:hidden" 
            @click="openSidebar"
          >
            <span class="material-icons">menu</span>
          </button>
          <h2 class="text-2xl font-bold">Chat IA Campus France</h2>
        </div>
        <div class="flex items-center gap-4">
          <span v-if="tokensRemaining !== null" class="text-sm">Tokens restants : {{ tokensRemaining }}</span>
          <button class="btn btn-outline btn-accent max-md:hidden" @click="goDashboard">⬅️ Retour au dashboard</button>
        </div>
      </div>

      <!-- Zone des messages -->
      <div class="flex-1 overflow-y-auto p-2 md:p-6 space-y-2 md:space-y-4 bg-base-200" ref="messagesContainer">
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

      <!-- Zone de saisie -->
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

      <!-- Message si plus de tokens -->
      <div v-if="tokensRemaining !== null && tokensRemaining <= 0" class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mt-2 flex items-center justify-between">
        <span>Vous n'avez plus de tokens. Veuillez augmenter votre solde pour continuer à discuter avec l'IA.</span>
        <button class="ml-4 px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] font-semibold" @click="goBuyTokens">Augmenter mes tokens</button>
      </div>
    </main>

    <!-- Modale de création -->
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
import { ref, onMounted, nextTick, watch, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { marked } from 'marked'

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
const tokensRemaining = ref(null)
const textareaInput = ref(null)
const sidebarOpen = ref(false)
const isMobile = ref(false)
const showCreateModal = ref(false)
const newConvTitle = ref('')
const createError = ref('')
const originalTitle = ref('')
const editInput = ref(null)

const API_URL = import.meta.env.VITE_API_URL

onMounted(async () => {
  await loadConversations()
  await loadUserTokens()
  adjustTextareaHeight()
  checkMobile()
  window.addEventListener('resize', checkMobile)

  const convId = route.query.conv
  if (convId && conversations.value.length > 0) {
    const found = conversations.value.find(c => String(c.id) === String(convId))
    if (found) selectConversation(found.id)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

watch(messages, () => {
  scrollToBottom()
})

function checkMobile() {
  isMobile.value = window.innerWidth < 768
  if (window.innerWidth >= 768) sidebarOpen.value = false
}
function openSidebar() {
  sidebarOpen.value = true
  document.body.style.overflow = 'hidden'
}
function closeSidebar() {
  sidebarOpen.value = false
  document.body.style.overflow = ''
}

async function loadUserTokens() {
  try {
    const response = await fetch(`${API_URL}/users/tokens`, {
      headers: { 'Authorization': `Bearer ${authStore.session?.access_token}` }
    })
    if (!response.ok) throw new Error('Erreur chargement tokens')
    const data = await response.json()
    tokensRemaining.value = data.tokens_remaining
  } catch (e) {
    console.error(e)
  }
}

async function loadConversations() {
  try {
    const res = await fetch(`${API_URL}/chat/conversations`, {
      headers: { 'Authorization': `Bearer ${authStore.session?.access_token}` }
    })
    if (!res.ok) throw new Error('Erreur chargement conversations')
    const data = await res.json()
    conversations.value = data.map(conv => ({ ...conv, isEditing: false }))
  } catch (e) {
    console.error(e)
  }
}

async function selectConversation(id) {
  if (!id) return
  try {
    const res = await fetch(`${API_URL}/chat/conversations/${id}/messages`, {
      headers: { 'Authorization': `Bearer ${authStore.session?.access_token}` }
    })
    if (!res.ok) throw new Error('Erreur chargement messages')
    const data = await res.json()
    activeConv.value = id
    messages.value = data
    await nextTick()
    scrollToBottom()
  } catch (e) {
    console.error(e)
  }
}

async function handleConversationClick(id) {
  await selectConversation(id)
  if (isMobile.value) closeSidebar()
}

function handleNewConversation(event) {
  event.preventDefault()
  event.stopPropagation()
  newConversation()
  if (isMobile.value) closeSidebar()
}

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
    const res = await fetch(`${API_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.session?.access_token}`
      },
      body: JSON.stringify({ title: newConvTitle.value })
    })
    if (!res.ok) throw new Error('Erreur création conversation')
    const data = await res.json()
    conversations.value.unshift({ ...data, isEditing: false })
    activeConv.value = data.id
    messages.value = []
    showCreateModal.value = false
    newConvTitle.value = ''
    createError.value = ''
    closeSidebar()
  } catch (e) {
    createError.value = e.message
  }
}

function cancelCreateConversation() {
  showCreateModal.value = false
  newConvTitle.value = ''
  createError.value = ''
}

async function sendMessage() {
  if (!input.value.trim() || isLoading.value || tokensRemaining.value <= 0) return
  if (!activeConv.value) {
    await newConversation()
    if (!activeConv.value) return
  }
  const message = input.value
  input.value = ''
  isLoading.value = true
  messages.value.push({ role: 'user', content: message })
  scrollToBottom()
  try {
    const res = await fetch(`${API_URL}/chat/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authStore.session?.access_token}`
      },
      body: JSON.stringify({ conversation_id: activeConv.value, content: message })
    })
    if (!res.ok) throw new Error('Erreur envoi message')
    const data = await res.json()
    messages.value.push({ role: 'assistant', content: data.message })
    tokensRemaining.value = data.tokens_remaining
    scrollToBottom()
  } catch (e) {
    input.value = message
    alert(e.message)
  } finally {
    isLoading.value = false
  }
  nextTick(() => {
    if (textareaInput.value) textareaInput.value.style.height = '2.5rem'
  })
}

function startEdit(conv) {
  originalTitle.value = conv.title
  conversations.value.forEach(c => {
    if (c.id !== conv.id) c.isEditing = false
  })
  conv.isEditing = true
  nextTick(() => {
    if (editInput.value) {
      editInput.value.focus()
      editInput.value.select()
    }
  })
}

async function handleRename(conv) {
  try {
    if (!conv.title.trim() || conv.title === originalTitle.value) {
      conv.title = originalTitle.value
      conv.isEditing = false
      return
    }

    const res = await fetch(`${API_URL}/chat/conversations/${conv.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${authStore.session?.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title: conv.title.trim() })
    })

    if (!res.ok) {
      conv.title = originalTitle.value
      throw new Error('Erreur lors du renommage')
    }

    conv.isEditing = false
  } catch (e) {
    console.error(e)
    conv.title = originalTitle.value
    conv.isEditing = false
  }
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

function adjustTextareaHeight() {
  const t = textareaInput.value
  if (t) {
    t.style.height = '0'
    t.style.height = Math.min(t.scrollHeight, 200) + 'px'
  }
}

function renderMarkdown(text) {
  return marked.parse(text || '')
}

function goDashboard() {
  router.push('/dashboard')
}

function goBuyTokens() {
  router.push('/dashboard?tab=tokens')
}
</script>

<style scoped>
.material-icons {
  font-family: 'Material Icons';
  font-style: normal;
  font-weight: normal;
  font-size: 24px;
  line-height: 1;
  display: inline-block;
  -webkit-font-feature-settings: 'liga';
  -webkit-font-smoothing: antialiased;
}
</style>
