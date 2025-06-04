<template>
  <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
    <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
      <button @click="$emit('close')" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      <h3 class="text-xl font-bold mb-4">Utilisateurs</h3>
      <table class="min-w-full bg-white rounded shadow">
        <thead>
          <tr>
            <th class="px-4 py-2 text-left text-gray-700 font-bold">Nom</th>
            <th class="px-4 py-2 text-left text-gray-700 font-bold">Email</th>
            <th class="px-4 py-2 text-left text-gray-700 font-bold">Rôle</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-t">
            <td class="px-4 py-2 text-gray-800">{{ user.first_name || user.nom }}</td>
            <td class="px-4 py-2 text-gray-800">{{ user.email }}</td>
            <td class="px-4 py-2 text-gray-800">{{ user.role }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  show: Boolean,
  users: Array
})
</script> 