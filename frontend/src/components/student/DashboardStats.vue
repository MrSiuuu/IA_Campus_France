<template>
  <div class="bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300">
    <h3 class="text-xl font-semibold mb-6 text-[#1F2937]">Statistiques</h3>
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <span class="text-gray-600">Tokens restants</span>
        <span class="text-[#6366F1] font-bold text-lg">{{ tokens }}</span>
      </div>
      <div class="flex justify-between items-center">
        <span class="text-gray-600">Conversations</span>
        <span class="text-[#6366F1] font-bold text-lg">{{ conversationsCount }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  tokens: {
    type: Number,
    required: true
  },
  conversationsCount: {
    type: Number,
    required: true
  }
})
</script> 