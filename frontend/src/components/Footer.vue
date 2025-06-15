<template>
  <footer class="bg-gray-900 px-4 sm:px-6 pt-12 pb-6">
    <div class="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
      <div class="space-y-6">
        <h6 class="text-white font-medium">SOLUTIONS IA</h6>
        <ul class="space-y-3">
          <li><a href="#" class="text-slate-400 hover:text-white">Génération de contenu</a></li>
          <li><a href="#" class="text-slate-400 hover:text-white">Analyse de données</a></li>
          <li><a href="#" class="text-slate-400 hover:text-white">Automatisation</a></li>
          <li><a href="#" class="text-slate-400 hover:text-white">Traitement du langage naturel</a></li>
        </ul>
      </div>
      <div class="space-y-6">
        <h6 class="text-white font-medium">CONTACT</h6>
        <ul class="space-y-3">
          <li>
            <router-link to="/contact" class="text-slate-400 hover:text-indigo-400 font-semibold">Contact</router-link>
          </li>
          <li>
            <router-link to="/report" class="text-slate-400 hover:text-indigo-400 font-semibold">Déclarer un souci</router-link>
          </li>
        </ul>
      </div>
      <div class="space-y-6">
        <h6 class="text-white font-medium">LÉGAL</h6>
        <ul class="space-y-3">
          <li><router-link to="/mentions-legales" class="text-slate-400 hover:text-white">Mentions légales</router-link></li>
          <li><router-link to="/confidentialite" class="text-slate-400 hover:text-white">Politique de confidentialité</router-link></li>
        </ul>
      </div>
    </div>

    <hr class="my-6 border-gray-600" />

    <div class="max-w-screen-xl mx-auto text-center mt-6">
      <p class="text-slate-400 mb-2">
        © 2024 IA Campus France. Tous droits réservés.
      </p>
      <div class="flex justify-center">
        <span class="font-bold text-2xl text-white tracking-widest">BTK</span>
      </div>
    </div>
  </footer>
</template> 