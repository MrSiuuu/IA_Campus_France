<template>
  <div class="bg-white rounded-2xl shadow-md p-8 text-center">
    <span class="text-4xl font-bold text-[#6366F1]">{{ tokens }}</span>
    <div class="mt-2 text-gray-600">tokens restants</div>
    
    <!-- Formulaire de code promo -->
    <div class="mt-6">
      <div class="flex gap-2">
        <input 
          v-model="promoCode"
          type="text"
          placeholder="Entrez votre code promo"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          :class="{ 'border-red-500': error }"
        />
        <button 
          @click="redeemPromo"
          class="px-4 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 font-semibold"
          :disabled="isLoading"
        >
          {{ isLoading ? 'Chargement...' : 'Utiliser' }}
        </button>
      </div>
      <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
      <p v-if="success" class="mt-2 text-sm text-green-500">{{ success }}</p>
    </div>

    <button 
      class="mt-6 px-6 py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 font-semibold" 
      @click="$emit('buy')"
    >
      Acheter / Augmenter mes tokens
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const props = defineProps({
  tokens: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['buy', 'tokens-updated'])

const promoCode = ref('')
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const redeemPromo = async () => {
  if (!promoCode.value) {
    error.value = 'Veuillez entrer un code promo'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    const response = await axios.post('/api/users/redeem-promo', {
      code: promoCode.value
    })

    success.value = `Code promo validé ! ${response.data.tokens_awarded} tokens ajoutés à votre compte.`
    promoCode.value = ''
    emit('tokens-updated', response.data.new_balance)
  } catch (err) {
    error.value = err.response?.data?.error || 'Une erreur est survenue'
  } finally {
    isLoading.value = false
  }
}
</script> 