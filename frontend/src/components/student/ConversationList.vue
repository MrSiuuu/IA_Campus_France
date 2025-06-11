<template>
  <div class="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
    <div class="space-y-4">
      <div v-for="conv in conversations" :key="conv.id" class="flex items-center justify-between p-6 bg-[#F5F7FA] rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
        <div>
          <h4 class="font-medium text-[#1F2937]">{{ conv.title }}</h4>
          <p class="text-gray-500">{{ new Date(conv.created_at).toLocaleDateString() }}</p>
        </div>
        <div class="flex gap-3">
          <button @click="$emit('resume', conv)" class="px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
            Reprendre
          </button>
          <button @click="$emit('delete', conv)" class="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 shadow-md hover:shadow-lg">
            Supprimer
          </button>
        </div>
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