<template>
  <div class="bg-white rounded-2xl shadow-md p-8 text-center">
    <span class="text-4xl font-bold text-[#6366F1]">{{ tokens }}</span>
    <div class="mt-2 text-gray-600">tokens restants</div>
    <button class="mt-6 px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 font-semibold" @click="$emit('buy')">
      Acheter / Augmenter mes tokens
    </button>
  </div>
</template>

<script setup>
defineProps({
  tokens: {
    type: Number,
    required: true
  }
})

defineEmits(['buy'])
</script> 