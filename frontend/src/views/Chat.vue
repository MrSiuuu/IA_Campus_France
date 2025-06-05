<template>
  <div class="min-h-screen flex bg-base-200">
    <!-- Sidebar historique -->
    <aside class="w-72 bg-base-300 text-base-content flex flex-col p-4 border-r border-base-100">
      <div class="mb-6 flex items-center justify-between">
        <span class="text-xl font-bold tracking-wide">Conversations</span>
        <button class="btn btn-sm btn-ghost" @click="goDashboard">
          <span class="material-icons">arrow_back</span>
        </button>
      </div>
      <ul class="flex-1 overflow-y-auto space-y-2">
        <li v-for="conv in conversations" :key="conv.id">
          <button class="btn btn-block btn-ghost justify-start" :class="{ 'bg-primary text-primary-content': conv.id === activeConv }" @click="selectConversation(conv.id)">
            <span class="truncate">{{ conv.title }}</span>
          </button>
        </li>
      </ul>
      <button class="btn btn-block btn-primary mt-4" @click="newConversation">+ Nouvelle conversation</button>
    </aside>

    <!-- Zone de chat -->
    <main class="flex-1 flex flex-col h-screen">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-base-100 bg-base-200">
        <h2 class="text-2xl font-bold">Chat IA Campus France</h2>
        <button class="btn btn-outline btn-accent" @click="goDashboard">⬅️ Retour au dashboard</button>
      </div>
      <!-- Messages -->
      <div class="flex-1 overflow-y-auto p-6 space-y-4 bg-base-200">
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
      </div>
      <!-- Zone de saisie -->
      <form class="p-4 flex gap-2 border-t border-base-100 bg-base-300" @submit.prevent>
        <label class="btn btn-square btn-ghost" title="Joindre un document">
          <span class="material-icons">attach_file</span>
          <input type="file" class="hidden" disabled />
        </label>
        <input v-model="input" type="text" class="input input-bordered flex-1" placeholder="Pose ta question à l'IA..." />
        <button class="btn btn-primary" type="submit">Envoyer</button>
      </form>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const conversations = ref([
  { id: 1, title: 'Démarches Campus France' },
  { id: 2, title: 'Visa étudiant' },
  { id: 3, title: 'Vie à Paris' }
])
const activeConv = ref(1)
const messages = ref([
  { id: 1, role: 'assistant', content: "Bonjour ! Comment puis-je t'aider ?" },
  { id: 2, role: 'user', content: 'Quels sont les documents pour le visa ?' },
  { id: 3, role: 'assistant', content: 'Pour un visa étudiant, il te faut : passeport, attestation Campus France, etc.' }
])
const input = ref('')

function goDashboard() {
  router.push('/dashboard')
}
function selectConversation(id) {
  activeConv.value = id
  // Charger l'historique (mock pour l'instant)
}
function newConversation() {
  // Créer une nouvelle conversation (mock)
  const newId = conversations.value.length + 1
  conversations.value.push({ id: newId, title: 'Nouvelle conversation' })
  activeConv.value = newId
  messages.value = [
    { id: 1, role: 'assistant', content: 'Bonjour ! Pose ta question.' }
  ]
}
</script>

<style scoped>
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