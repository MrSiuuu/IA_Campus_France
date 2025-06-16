<template>
  <div class="max-w-md mx-auto w-full md:bg-white md:shadow-lg md:rounded-2xl md:p-8 p-2 flex flex-col gap-4">
    <div v-for="conv in conversations" :key="conv.id" class="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 p-3 md:p-6 bg-[#F5F7FA] md:rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
      <div>
        <h4 class="font-medium text-[#1F2937]">{{ conv.title }}</h4>
        <p class="text-gray-500">{{ new Date(conv.created_at).toLocaleDateString() }}</p>
      </div>
      <div class="flex flex-col md:flex-row gap-2 md:gap-3 w-full md:w-auto">
        <button @click="$emit('resume', conv)" class="w-full md:w-auto px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
          Reprendre
        </button>
        <button @click="$emit('delete', conv)" class="w-full md:w-auto px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg">
          Supprimer
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  conversations: {
    type: Array,
    required: true
  }
})

defineEmits(['resume', 'delete'])
</script> 