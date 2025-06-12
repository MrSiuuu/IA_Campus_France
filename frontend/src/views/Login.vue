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

const router = useRouter()
const email = ref('')
const password = ref('')
const auth = useAuthStore()

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      // Stocker le token et les infos utilisateur via le store
      auth.login(data.session.access_token, data.user)
      
      if (data.user.role === 'admin') {
        alert('Bienvenue administrateur !')
        router.push('/admin')
      } else {
        alert('Bienvenue étudiant !')
        router.push('/dashboard')
      }
    } else {
      alert(data.error || 'Erreur lors de la connexion')
    }
  } catch (error) {
    console.error('Erreur:', error)
    alert('Erreur de connexion')
  }
}
</script> 