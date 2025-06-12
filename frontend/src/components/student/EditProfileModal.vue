<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6 relative animate-fade-in">
      <button @click="$emit('close')" class="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
      <h2 class="text-2xl font-bold mb-6 text-[#1F2937] dark:text-white text-center">Modifier mon profil</h2>
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div class="form-control">
          <label class="label"><span class="label-text dark:text-gray-200">Prénom</span></label>
          <input type="text" v-model="form.first_name" class="input input-bordered w-full dark:bg-gray-800 dark:text-white" required />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text dark:text-gray-200">Nom</span></label>
          <input type="text" v-model="form.last_name" class="input input-bordered w-full dark:bg-gray-800 dark:text-white" required />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text dark:text-gray-200">Email</span></label>
          <input type="email" v-model="form.email" class="input input-bordered w-full dark:bg-gray-800 dark:text-white" disabled />
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text dark:text-gray-200">Pays d'origine</span></label>
          <select v-model="form.country" class="select select-bordered w-full dark:bg-gray-800 dark:text-white" required>
            <option value="">Sélectionnez votre pays</option>
            <option v-for="c in westAfricanCountries" :key="c.code" :value="c.name">
              {{ c.name }}
            </option>
          </select>
        </div>
        <div class="form-control">
          <label class="label"><span class="label-text dark:text-gray-200">Niveau d'études</span></label>
          <input type="text" v-model="form.education_level" class="input input-bordered w-full dark:bg-gray-800 dark:text-white" required />
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="$emit('close')" class="btn btn-ghost">Annuler</button>
          <button type="submit" class="btn btn-primary">Enregistrer</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch } from 'vue'
const props = defineProps({
  profile: { type: Object, required: true }
})
const emit = defineEmits(['close', 'save'])

const westAfricanCountries = [
  { code: 'CIV', name: "Côte d'Ivoire" },
  { code: 'SEN', name: 'Sénégal' },
  { code: 'BFA', name: 'Burkina Faso' },
  { code: 'MLI', name: 'Mali' },
  { code: 'NER', name: 'Niger' },
  { code: 'TGO', name: 'Togo' },
  { code: 'BEN', name: 'Bénin' },
  { code: 'GIN', name: 'Guinée' },
  { code: 'GNB', name: 'Guinée-Bissau' },
  { code: 'MRT', name: 'Mauritanie' },
  { code: 'GAB', name: 'Gabon' },
  { code: 'CMR', name: 'Cameroun' }
]

const form = reactive({
  first_name: '',
  last_name: '',
  email: '',
  country: '',
  education_level: ''
})

// Toujours pré-remplir le formulaire à chaque ouverture de la modal
watch(() => props.profile, (val) => {
  if (val) {
    form.first_name = val.first_name || ''
    form.last_name = val.last_name || ''
    form.email = val.email || ''
    form.country = val.country || ''
    form.education_level = val.education_level || ''
  }
}, { immediate: true, deep: true })

function handleSubmit() {
  emit('save', { ...form })
}
</script>

<style scoped>
@media (max-width: 640px) {
  .max-w-md {
    max-width: 95vw;
    padding: 1rem;
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s;
}
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style> 