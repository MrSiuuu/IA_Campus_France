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
            class="w-full py-2.5 px-4 tracking-wider text-sm rounded-md text-white bg-slate-800 hover:bg-slate-900 focus:outline-none cursor-pointer"
          >
            Se connecter
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

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Erreur de connexion')
    }

    const data = await response.json()
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
    alert(error.message || 'Erreur lors de la connexion')
  }
}
</script> 