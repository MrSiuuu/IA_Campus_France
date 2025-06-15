<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-4">Inscription</h2>
        
        <!-- Alerte de succès -->
        <div v-if="success" class="mb-6 bg-white shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] border-l-[6px] border-green-600 text-slate-900 flex items-center w-full p-4 rounded-md" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] shrink-0 fill-green-600 inline mr-3" viewBox="0 0 32 32">
            <path d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm7.07 10.07l-8.5 8.5a1 1 0 0 1-1.41 0l-4.5-4.5a1 1 0 0 1 1.41-1.41L14 16.17l7.79-7.79a1 1 0 0 1 1.41 1.41z" data-original="#00c853" />
          </svg>
          <span class="text-[15px] font-semibold tracking-wide">{{ success }}</span>
        </div>

        <!-- Alerte d'erreur -->
        <div v-if="error" class="mb-6 bg-white shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] border-l-[6px] border-red-600 text-slate-900 flex items-center w-full p-4 rounded-md" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] shrink-0 fill-red-600 inline mr-3" viewBox="0 0 32 32">
            <path d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z" data-original="#ea2d3f" />
          </svg>
          <span class="text-[15px] font-semibold tracking-wide">{{ error }}</span>
        </div>

        <form @submit.prevent="handleRegister" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Prénom</span>
            </label>
            <input 
              type="text" 
              v-model="firstName" 
              placeholder="Votre prénom" 
              class="input input-bordered" 
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Nom</span>
            </label>
            <input 
              type="text" 
              v-model="lastName" 
              placeholder="Votre nom" 
              class="input input-bordered" 
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Email</span>
            </label>
            <input 
              type="email" 
              v-model="email" 
              placeholder="votre@email.com" 
              class="input input-bordered" 
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Mot de passe</span>
            </label>
            <input 
              type="password" 
              v-model="password" 
              placeholder="••••••••" 
              class="input input-bordered" 
              required
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Pays d'origine</span>
            </label>
            <select v-model="country" class="select select-bordered" required>
              <option value="">Sélectionnez votre pays</option>
              <option v-for="c in westAfricanCountries" :key="c.code" :value="c.name">
                {{ c.name }}
              </option>
            </select>
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Niveau d'études</span>
            </label>
            <select v-model="educationLevel" class="select select-bordered" required>
              <option value="">Sélectionnez votre niveau</option>
              <option value="Licence">Licence</option>
              <option value="Master">Master</option>
              <option value="Doctorat">Doctorat</option>
            </select>
          </div>
          <div class="form-control mt-6">
            <button 
              type="submit" 
              :disabled="isLoading"
              class="btn btn-primary w-full inline-flex items-center justify-center"
            >
              <svg v-if="isLoading" aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
              </svg>
              {{ isLoading ? 'Inscription en cours...' : 'S\'inscrire' }}
            </button>
          </div>
        </form>
        <div class="text-center mt-4">
          <p>Déjà un compte ? 
            <router-link to="/login" class="link link-primary">Se connecter</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const password = ref('')
const country = ref('')
const educationLevel = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref('')

// Liste des pays africains francophones de l'ouest
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

const handleRegister = async () => {
  isLoading.value = true
  error.value = ''
  success.value = ''
  try {
    const response = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        first_name: firstName.value,
        last_name: lastName.value,
        country: country.value,
        education_level: educationLevel.value,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || 'Erreur lors de l\'inscription'
      return
    }

    success.value = 'Inscription réussie ! Vous pouvez maintenant vous connecter.'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    console.error('Erreur:', error)
    error.value = 'Erreur lors de l\'inscription. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script> 