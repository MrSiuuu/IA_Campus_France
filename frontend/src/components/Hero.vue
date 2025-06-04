<template>
  <div class="hero min-h-[70vh] bg-base-200">
    <div class="hero-content text-center">
      <div class="max-w-3xl">
        <h1 class="text-5xl font-bold mb-8">Bienvenue sur IA Campus France</h1>
        <p class="text-xl mb-8">
          Votre assistant intelligent pour préparer votre dossier Campus France. 
          Obtenez des réponses précises sur les démarches administratives, 
          les logements, les écoles et bien plus encore.
        </p>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Démarches Administratives</h2>
              <p>Visa, inscription, documents requis...</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Logement & Vie Étudiante</h2>
              <p>Logements, coûts, transports...</p>
            </div>
          </div>
          <div class="card bg-base-100 shadow-xl">
            <div class="card-body">
              <h2 class="card-title">Études & Formations</h2>
              <p>Écoles, universités, programmes...</p>
            </div>
          </div>
        </div>
        <div class="flex justify-center gap-4">
          <router-link to="/register" class="btn btn-primary">Commencer</router-link>
          <router-link to="/login" class="btn btn-outline">Se connecter</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Pas besoin de logique pour le moment
</script> 