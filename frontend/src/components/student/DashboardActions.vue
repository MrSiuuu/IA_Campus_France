<template>
  <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
    <h3 class="text-xl font-semibold mb-6 text-[#1F2937]">Actions rapides</h3>
    <div class="space-y-4">
      <button @click="$emit('navigate', 'chat')" class="w-full text-left px-6 py-4 bg-white text-[#6366F1] rounded-xl hover:bg-[#F5F7FA] transition-all duration-300 border-2 border-[#6366F1] hover:border-[#4F46E5] shadow-sm hover:shadow-md">
        🧠 Parler à l'IA
      </button>
      <button @click="$emit('navigate', 'documents')" class="w-full text-left px-6 py-4 bg-white text-[#6366F1] rounded-xl hover:bg-[#F5F7FA] transition-all duration-300 border-2 border-[#6366F1] hover:border-[#4F46E5] shadow-sm hover:shadow-md">
        📁 Gérer mes documents
      </button>
      <button @click="$emit('navigate', 'conversations')" class="w-full text-left px-6 py-4 bg-white text-[#6366F1] rounded-xl hover:bg-[#F5F7FA] transition-all duration-300 border-2 border-[#6366F1] hover:border-[#4F46E5] shadow-sm hover:shadow-md">
        📜 Voir mes conversations
      </button>
    </div>
  </div>
</template>

<script setup>
defineEmits(['navigate'])
</script> 