<template>
  <div class="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-[#1F2937]">Logs des conversations</h3>
      <div class="flex gap-4">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Rechercher une conversation..."
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
        />
        <select
          v-model="filterDate"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
        >
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>
    </div>
    <div class="space-y-4">
      <div v-for="chat in filteredChats" :key="chat.id" class="p-6 bg-[#F5F7FA] rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
        <div class="flex justify-between items-start mb-4">
          <div>
            <h4 class="font-medium text-[#1F2937]">{{ chat.title }}</h4>
            <p class="text-sm text-gray-500">Par {{ chat.user_name }} le {{ new Date(chat.created_at).toLocaleDateString() }}</p>
          </div>
          <button @click="$emit('view', chat)" class="px-4 py-2 bg-[#6366F1] text-white rounded-lg hover:bg-[#4F46E5] transition-all duration-300">
            Voir les détails
          </button>
        </div>
        <div class="space-y-2">
          <div v-for="(message, index) in chat.messages.slice(0, 2)" :key="index" class="text-sm text-gray-600">
            <span class="font-medium">{{ message.role === 'user' ? 'Étudiant' : 'IA' }}:</span>
            {{ message.content.substring(0, 100) }}...
          </div>
        </div>
        <div class="mt-4 text-sm text-gray-500">
          {{ chat.messages.length }} messages • {{ chat.tokens_used }} tokens utilisés
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  chats: {
    type: Array,
    required: true
  }
})

const searchQuery = ref('')
const filterDate = ref('all')

const filteredChats = computed(() => {
  return props.chats.filter(chat => {
    const matchesSearch = chat.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         chat.user_name.toLowerCase().includes(searchQuery.value.toLowerCase())
    
    const chatDate = new Date(chat.created_at)
    const today = new Date()
    const matchesDate = filterDate.value === 'all' ||
                       (filterDate.value === 'today' && chatDate.toDateString() === today.toDateString()) ||
                       (filterDate.value === 'week' && (today - chatDate) <= 7 * 24 * 60 * 60 * 1000) ||
                       (filterDate.value === 'month' && chatDate.getMonth() === today.getMonth() && chatDate.getFullYear() === today.getFullYear())
    
    return matchesSearch && matchesDate
  })
})

defineEmits(['view'])
</script> 