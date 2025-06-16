<template>
  <div class="bg-white max-w-4xl flex items-center mx-auto md:min-h-screen p-4">
    <div class="grid md:grid-cols-3 items-center [box-shadow:0_2px_10px_-3px_rgba(14,14,14,0.3)] rounded-xl overflow-hidden">
      <div class="max-md:order-1 flex flex-col justify-center md:space-y-16 space-y-8 max-md:mt-16 min-h-full bg-gradient-to-r from-slate-900 to-slate-700 lg:px-8 px-4 py-4">
        <div>
          <h3 class="text-white text-lg">Bienvenue sur Campus France</h3>
          <p class="text-[13px] text-slate-300 mt-3 leading-relaxed">Connectez-vous pour accéder à votre espace personnel et gérer vos candidatures.</p>
        </div>
        <div>
          <h3 class="text-white text-lg">Accès Sécurisé</h3>
          <p class="text-[13px] text-slate-300 mt-3 leading-relaxed">Votre sécurité est notre priorité. Toutes vos données sont protégées et sécurisées.</p>
        </div>
      </div>

      <form @submit.prevent="handleLogin" class="md:col-span-2 w-full py-6 px-6 sm:px-14 max-w-lg mx-auto">
        <div class="mb-8">
          <h1 class="text-slate-900 text-2xl font-bold">Connexion</h1>
        </div>

        <!-- Alerte d'erreur -->
        <div v-if="error" class="mb-6 bg-white shadow-[0_3px_10px_-3px_rgba(6,81,237,0.3)] border-l-[6px] border-red-600 text-slate-900 flex items-center w-full p-4 rounded-md" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-[18px] shrink-0 fill-red-600 inline mr-3" viewBox="0 0 32 32">
            <path d="M16 1a15 15 0 1 0 15 15A15 15 0 0 0 16 1zm6.36 20L21 22.36l-5-4.95-4.95 4.95L9.64 21l4.95-5-4.95-4.95 1.41-1.41L16 14.59l5-4.95 1.41 1.41-5 4.95z" data-original="#ea2d3f" />
          </svg>
          <span class="text-[15px] font-semibold tracking-wide">{{ error }}</span>
        </div>

        <div class="space-y-6">
          <div>
            <label class="text-slate-900 text-sm font-medium mb-2 block">Email</label>
            <div class="relative flex items-center">
              <input 
                v-model="email" 
                type="email" 
                required 
                class="text-slate-900 bg-white border border-slate-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500" 
                placeholder="Entrez votre email" 
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" class="w-4 h-4 absolute right-4" viewBox="0 0 682.667 682.667">
                <defs>
                  <clipPath id="a" clipPathUnits="userSpaceOnUse">
                    <path d="M0 512h512V0H0Z" data-original="#000000"></path>
                  </clipPath>
                </defs>
                <g clip-path="url(#a)" transform="matrix(1.33 0 0 -1.33 0 682.667)">
                  <path fill="none" stroke-miterlimit="10" stroke-width="40" d="M452 444H60c-22.091 0-40-17.909-40-40v-39.446l212.127-157.782c14.17-10.54 33.576-10.54 47.746 0L492 364.554V404c0 22.091-17.909 40-40 40Z" data-original="#000000"></path>
                  <path d="M472 274.9V107.999c0-11.027-8.972-20-20-20H60c-11.028 0-20 8.973-20 20V274.9L0 304.652V107.999c0-33.084 26.916-60 60-60h392c33.084 0 60 26.916 60 60v196.653Z" data-original="#000000"></path>
                </g>
              </svg>
            </div>
          </div>
          <div>
            <label class="text-slate-900 text-sm font-medium mb-2 block">Mot de passe</label>
            <div class="relative flex items-center">
              <input 
                v-model="password" 
                type="password" 
                required 
                class="text-slate-900 bg-white border border-slate-300 w-full text-sm pl-4 pr-8 py-2.5 rounded-md outline-blue-500" 
                placeholder="Entrez votre mot de passe" 
              />
              <svg xmlns="http://www.w3.org/2000/svg" fill="#bbb" stroke="#bbb" class="w-4 h-4 absolute right-4 cursor-pointer" viewBox="0 0 128 128">
                <path d="M64 104C22.127 104 1.367 67.496.504 65.943a4 4 0 0 1 0-3.887C1.367 60.504 22.127 24 64 24s62.633 36.504 63.496 38.057a4 4 0 0 1 0 3.887C126.633 67.496 105.873 104 64 104zM8.707 63.994C13.465 71.205 32.146 96 64 96c31.955 0 50.553-24.775 55.293-31.994C114.535 56.795 95.854 32 64 32 32.045 32 13.447 56.775 8.707 63.994zM64 88c-13.234 0-24-10.766-24-24s10.766-24 24-24 24 10.766 24 24-10.766 24-24 24zm0-40c-8.822 0-16 7.178-16 16s7.178 16 16 16 16-7.178 16-16-7.178-16-16-16z" data-original="#000000"></path>
              </svg>
            </div>
          </div>
          <div class="flex items-center">
            <input 
              id="remember-me" 
              v-model="rememberMe" 
              type="checkbox" 
              class="h-4 w-4 shrink-0 text-blue-600 focus:ring-blue-500 border-slate-300 rounded" 
            />
            <label for="remember-me" class="ml-3 block text-sm text-slate-600">
              Se souvenir de moi
            </label>
          </div>
        </div>

        <div class="mt-8">
          <button 
            type="submit" 
            :disabled="isLoading"
            class="w-full py-2.5 px-4 tracking-wider text-sm rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none cursor-pointer inline-flex items-center justify-center"
          >
            <svg v-if="isLoading" aria-hidden="true" role="status" class="inline w-4 h-4 me-3 text-white animate-spin" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="#E5E7EB"/>
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentColor"/>
            </svg>
            {{ isLoading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </div>

        <p class="text-slate-600 text-sm mt-6 text-center">
          Pas encore de compte ? 
          <router-link to="/register" class="text-blue-600 font-medium hover:underline ml-1">
            S'inscrire ici
          </router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const isLoading = ref(false)
const error = ref('')

const apiUrl = import.meta.env.VITE_API_URL

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const response = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      error.value = data.error || 'Erreur de connexion'
      return
    }

    authStore.login(data.session, data.user)
    
    if (data.user) {
      userStore.setUser(data.user)
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    }
  } catch (error) {
    console.error('Erreur de connexion:', error)
    error.value = 'Erreur lors de la connexion. Veuillez réessayer.'
  } finally {
    isLoading.value = false
  }
}
</script> 