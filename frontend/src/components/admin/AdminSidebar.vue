<template>
  <aside class="w-64 bg-[#1E1E2F] text-white flex flex-col py-8 px-4">
    <div class="mb-10 flex items-center justify-center">
      <span class="text-2xl font-bold tracking-wide">Espace Admin</span>
    </div>
    <nav class="flex-1 space-y-2">
      <button
        v-for="item in navItems"
        :key="item.tab"
        @click="$emit('change-tab', item.tab)"
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
    <button @click="$emit('logout')" class="mt-10 px-4 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 w-full shadow-lg hover:shadow-xl">
      🔐 Déconnexion
    </button>
  </aside>
</template>

<script setup>
const props = defineProps({
  activeTab: {
    type: String,
    required: true
  }
})

const navItems = [
  { label: 'Accueil', tab: 'accueil', icon: 'dashboard' },
  { label: 'Utilisateurs', tab: 'users', icon: 'group' },
  { label: 'Documents partagés', tab: 'documents', icon: 'folder_shared' },
  { label: 'Base de connaissances', tab: 'knowledge', icon: 'menu_book' },
  { label: 'Logs des conversations', tab: 'chats', icon: 'chat' }
]

defineEmits(['change-tab', 'logout'])
</script> 