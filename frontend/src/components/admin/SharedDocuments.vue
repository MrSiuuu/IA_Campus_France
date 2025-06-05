<template>
  <div class="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-[#1F2937]">Documents partagés</h3>
      <button @click="$emit('add')" class="px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
        Ajouter un document
      </button>
    </div>
    <div class="space-y-4">
      <div v-for="doc in documents" :key="doc.id" class="flex items-center justify-between p-6 bg-[#F5F7FA] rounded-xl hover:bg-white hover:shadow-md transition-all duration-300">
        <div>
          <h4 class="font-medium text-[#1F2937]">{{ doc.file_name }}</h4>
          <p class="text-gray-500">{{ doc.file_type }}</p>
          <p class="text-sm text-gray-400">Partagé le {{ new Date(doc.created_at).toLocaleDateString() }}</p>
        </div>
        <div class="flex gap-3">
          <button @click="$emit('view', doc)" class="px-4 py-2 bg-white text-[#6366F1] rounded-lg hover:bg-[#F5F7FA] transition-all duration-300 border border-[#6366F1]">
            Voir
          </button>
          <button @click="$emit('edit', doc)" class="px-4 py-2 bg-white text-[#6366F1] rounded-lg hover:bg-[#F5F7FA] transition-all duration-300 border border-[#6366F1]">
            Modifier
          </button>
          <button @click="$emit('delete', doc)" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  documents: {
    type: Array,
    required: true
  }
})

defineEmits(['add', 'view', 'edit', 'delete'])
</script> 