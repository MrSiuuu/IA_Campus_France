<template>
  <div class="bg-white dark:bg-gray-900 shadow-lg rounded-2xl p-8 hover:shadow-xl transition-all duration-300 max-w-md mx-auto">
    <div class="flex flex-col items-center mb-8">
      <div v-if="profile.photo" class="mb-4">
        <img :src="profile.photo" alt="Avatar" class="h-20 w-20 rounded-full border-4 border-[#6366F1]" />
      </div>
      <div v-else class="h-20 w-20 rounded-full border-4 border-[#6366F1] bg-[#6366F1] flex items-center justify-center mb-4">
        <span class="text-2xl font-bold text-white">{{ getInitials(profile.first_name, profile.last_name) }}</span>
      </div>
      <div class="w-full space-y-2 text-center">
        <div class="text-xl font-medium text-[#1F2937] dark:text-white">{{ profile.first_name }} {{ profile.last_name }}</div>
        <div class="text-gray-500 dark:text-gray-300">{{ profile.email }}</div>
        <div class="text-[#6366F1] font-medium">{{ profile.country }}</div>
        <div class="text-[#6366F1] font-medium">{{ profile.education_level }}</div>
      </div>
    </div>
    <div class="flex justify-center mt-6">
      <button @click="$emit('edit')" class="px-8 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
        Modifier mon profil
      </button>
    </div>
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

function getInitials(first, last) {
  return (first?.[0] || '').toUpperCase() + (last?.[0] || '').toUpperCase()
}
</script> 