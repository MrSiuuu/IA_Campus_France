<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold text-center mb-4">Connexion</h2>
        <form @submit.prevent="handleLogin" class="space-y-4">
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
          <div class="form-control mt-6">
            <button type="submit" class="btn btn-primary">Se connecter</button>
          </div>
        </form>
        <div class="text-center mt-4">
          <p>Pas encore de compte ? 
            <router-link to="/register" class="link link-primary">S'inscrire</router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useUserStore } from '../stores/user'

const router = useRouter()
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const userStore = useUserStore()

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

    if (response.ok) {
      const data = await response.json()
      auth.login(data.session, data.user)
      if (data.user.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      const error = await response.json()
      alert(error.message || 'Erreur de connexion')
    }
  } catch (error) {
    console.error('Erreur lors de la connexion:', error)
    alert('Erreur lors de la connexion')
  }
}
</script> 