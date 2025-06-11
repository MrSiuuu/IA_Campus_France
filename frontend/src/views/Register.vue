<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-4">Inscription</h2>
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
            <button type="submit" class="btn btn-primary">S'inscrire</button>
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

    if (response.ok) {
      alert('Inscription réussie ! Vous pouvez maintenant vous connecter.')
      router.push('/login')
    } else {
      alert(data.error || 'Erreur lors de l\'inscription')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur lors de l\'inscription')
  }
}
</script> 