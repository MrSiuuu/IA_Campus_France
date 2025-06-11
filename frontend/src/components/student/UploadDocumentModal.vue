<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-[#232336] rounded-2xl shadow-xl p-8 w-full max-w-md relative">
      <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white">
        <span class="material-icons">close</span>
      </button>
      <h2 class="text-2xl font-bold mb-6 text-[#1F2937] dark:text-white">Ajouter un document</h2>
      <form @submit.prevent="handleUpload">
        <div class="mb-4">
          <label class="block mb-2 text-gray-700 dark:text-gray-200">Type de document</label>
          <select v-model="fileType" class="w-full p-2 border rounded-xl focus:outline-none" required>
            <option value="">Sélectionner</option>
            <option value="cv">CV</option>
            <option value="letter">Lettre de motivation</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-2 text-gray-700 dark:text-gray-200">Fichier (PDF, DOC, DOCX)</label>
          <input type="file" accept=".pdf,.doc,.docx" @change="onFileChange" class="w-full" required />
        </div>
        <div v-if="error" class="text-red-500 mb-2">{{ error }}</div>
        <div v-if="success" class="text-green-600 mb-2">Document ajouté avec succès !</div>
        <button type="submit" :disabled="loading" class="w-full py-3 bg-[#6366F1] text-white rounded-xl hover:bg-[#4F46E5] transition-all duration-300 shadow-md hover:shadow-lg">
          <span v-if="loading">Chargement...</span>
          <span v-else>Uploader</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '../../stores/user.js'

const props = defineProps({
  show: Boolean
})
const emit = defineEmits(['close', 'uploaded'])

const file = ref(null)
const fileType = ref('')
const loading = ref(false)
const error = ref('')
const success = ref(false)

const userStore = useUserStore()

function onFileChange(e) {
  file.value = e.target.files[0]
}

async function handleUpload() {
  error.value = ''
  success.value = false
  if (!file.value || !fileType.value) {
    error.value = 'Veuillez sélectionner un type et un fichier.'
    return
  }
  loading.value = true
  try {
    const token = userStore.token
    if (!token) throw new Error('Utilisateur non authentifié')

    // Créer un FormData pour l'envoi du fichier
    const formData = new FormData()
    formData.append('file', file.value)
    formData.append('file_type', fileType.value)

    // Envoyer au backend
    const res = await fetch('http://localhost:3001/api/documents/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    })

    if (!res.ok) throw new Error('Erreur lors de l\'enregistrement')
    
    success.value = true
    emit('uploaded')
    setTimeout(() => {
      emit('close')
    }, 1000)
  } catch (e) {
    error.value = e.message || 'Erreur inconnue'
  } finally {
    loading.value = false
  }
}
</script> 