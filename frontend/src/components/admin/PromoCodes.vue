<template>
  <div class="bg-white rounded-2xl shadow-md p-8">
    <h2 class="text-2xl font-bold text-gray-800 mb-6">Gestion des codes promo</h2>

    <!-- Formulaire de création -->
    <div class="mb-8 p-6 bg-gray-50 rounded-xl">
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Créer un nouveau code</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
          <input 
            v-model="newCode.code"
            type="text"
            placeholder="ex: WELCOME5"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Tokens à offrir</label>
          <input 
            v-model.number="newCode.token_amount"
            type="number"
            min="1"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Utilisations max (optionnel)</label>
          <input 
            v-model.number="newCode.max_uses"
            type="number"
            min="1"
            placeholder="Illimité si vide"
            class="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#6366F1]"
          />
        </div>
      </div>
      <button 
        @click="createPromoCode"
        class="mt-4 px-6 py-2 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 font-semibold"
        :disabled="isLoading"
      >
        {{ isLoading ? 'Création...' : 'Créer le code' }}
      </button>
      <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
      <p v-if="success" class="mt-2 text-sm text-green-500">{{ success }}</p>
    </div>

    <!-- Liste des codes -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tokens</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisations</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="code in promoCodes" :key="code.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ code.code }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ code.token_amount }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ code.used_by.length }} / {{ code.max_uses || '∞' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                :class="[
                  'px-2 py-1 text-xs font-semibold rounded-full',
                  code.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                ]"
              >
                {{ code.is_active ? 'Actif' : 'Inactif' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <button 
                v-if="code.is_active"
                @click="deactivateCode(code.id)"
                class="text-red-600 hover:text-red-900"
              >
                Désactiver
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const promoCodes = ref([])
const newCode = ref({
  code: '',
  token_amount: null,
  max_uses: null
})
const error = ref('')
const success = ref('')
const isLoading = ref(false)

const loadPromoCodes = async () => {
  try {
    const response = await axios.get('/admin/promo-codes')
    promoCodes.value = response.data
  } catch (err) {
    error.value = 'Erreur lors du chargement des codes promo'
  }
}

const createPromoCode = async () => {
  if (!newCode.value.code || !newCode.value.token_amount) {
    error.value = 'Veuillez remplir tous les champs obligatoires'
    return
  }

  isLoading.value = true
  error.value = ''
  success.value = ''

  try {
    await axios.post('/admin/promo-codes', newCode.value)
    success.value = 'Code promo créé avec succès'
    newCode.value = { code: '', token_amount: null, max_uses: null }
    await loadPromoCodes()
  } catch (err) {
    error.value = err.response?.data?.error || 'Erreur lors de la création du code'
  } finally {
    isLoading.value = false
  }
}

const deactivateCode = async (id) => {
  try {
    await axios.put(`/admin/promo-codes/${id}/deactivate`)
    await loadPromoCodes()
    success.value = 'Code promo désactivé avec succès'
  } catch (err) {
    error.value = 'Erreur lors de la désactivation du code'
  }
}

onMounted(loadPromoCodes)
</script> 