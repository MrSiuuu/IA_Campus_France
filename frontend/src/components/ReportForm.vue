<template>
  <section class="bg-white dark:bg-gray-900 rounded-lg shadow-md">
    <div class="py-8 lg:py-12 px-4 mx-auto max-w-screen-md">
      <h2 class="mb-4 text-4xl tracking-tight font-extrabold text-center text-gray-900 dark:text-white">Déclarer un souci</h2>
      <p class="mb-8 lg:mb-12 font-light text-center text-gray-500 dark:text-gray-400 sm:text-lg">
        Un bug, un problème technique ou une suggestion ? Merci de détailler votre souci ci-dessous, nous traiterons votre demande rapidement.
      </p>
      <form @submit.prevent="handleSubmit" class="space-y-8">
        <div>
          <label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Nom</label>
          <input v-model="form.name" type="text" id="name" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Votre nom" required />
        </div>
        <div>
          <label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email</label>
          <input v-model="form.email" type="email" id="email" class="shadow-sm bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="nom@exemple.com" required />
        </div>
        <div>
          <label for="subject" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Type de souci</label>
          <input v-model="form.subject" type="text" id="subject" class="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Ex : Problème de connexion, bug, etc." required />
        </div>
        <div class="sm:col-span-2">
          <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Description</label>
          <textarea v-model="form.message" id="message" rows="6" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg shadow-sm border border-gray-300 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-indigo-500 dark:focus:border-indigo-500" placeholder="Décrivez le souci rencontré..." required></textarea>
        </div>
        <button type="submit" class="py-3 px-5 text-sm font-medium text-center text-white rounded-lg bg-indigo-700 sm:w-fit hover:bg-indigo-800 focus:ring-4 focus:outline-none focus:ring-indigo-300 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:focus:ring-indigo-800 transition">Envoyer</button>
        <div v-if="success" class="text-green-600 mt-2">Votre déclaration a bien été envoyée !</div>
        <div v-if="error" class="text-red-600 mt-2">Une erreur est survenue. Veuillez réessayer.</div>
      </form>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
const apiUrl = import.meta.env.VITE_API_URL
const form = ref({ name: '', email: '', subject: '', message: '' })
const success = ref(false)
const error = ref(false)

async function handleSubmit() {
  success.value = false
  error.value = false
  try {
    const res = await fetch(`${apiUrl}/contact/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form.value, type: 'report' })
    })
    if (!res.ok) throw new Error('Erreur')
    form.value = { name: '', email: '', subject: '', message: '' }
    success.value = true
  } catch (e) {
    error.value = true
  }
}
</script> 