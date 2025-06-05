<template>
  <div class="bg-white shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300">
    <div class="flex items-center mb-8">
      <img :src="profile.photo || 'https://via.placeholder.com/150'" alt="Avatar" class="h-20 w-20 rounded-full border-4 border-[#6366F1]" />
      <div class="ml-6">
        <h3 class="text-xl font-medium text-[#1F2937]">{{ profile.first_name }} {{ profile.last_name }}</h3>
        <p class="text-gray-500">{{ profile.email }}</p>
        <p class="text-[#6366F1] font-medium">{{ profile.country }} - {{ profile.education_level }}</p>
      </div>
    </div>
    <button @click="$emit('edit')" class="px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
      Modifier mon profil
    </button>
  </div>
</template>

<script setup>
defineProps({
  profile: {
    type: Object,
    required: true
  }
})

defineEmits(['edit'])
</script> 