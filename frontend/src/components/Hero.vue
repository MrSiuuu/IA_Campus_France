<template>
  <section class="relative w-full h-[90vh] overflow-hidden pt-[72px] bg-[#0f172a] text-white">
    <!-- SVG animé en fond -->
    <svg class="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="rgba(100,116,139,0.05)">
            <animate attributeName="stop-color" values="rgba(100,116,139,0.05);rgba(30,41,59,0.3);rgba(100,116,139,0.05)" dur="10s" repeatCount="indefinite" />
          </stop>
          <stop offset="100%" stop-color="rgba(100, 116, 139, 0.1)" />
        </linearGradient>

        <pattern id="grid" width="80" height="80" patternUnits="userSpaceOnUse">
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="url(#lineGradient)" stroke-width="1.5" />
        </pattern>

        <pattern id="blueSquares" width="400" height="400" patternUnits="userSpaceOnUse">
          <rect x="80" y="0" width="80" height="80" fill="rgba(99,102,241,0.06)">
            <animate attributeName="fill" values="rgba(99,102,241,0.04);rgba(99,102,241,0.08);rgba(99,102,241,0.04)" dur="8s" repeatCount="indefinite" />
          </rect>
          <rect x="240" y="80" width="80" height="80" fill="rgba(99,102,241,0.05)" />
          <rect x="160" y="240" width="80" height="80" fill="rgba(99,102,241,0.04)" />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill="url(#grid)" />
      <rect width="100%" height="100%" fill="url(#blueSquares)" />
    </svg>

    <!-- Contenu par-dessus -->
    <div class="relative z-10 flex flex-col items-center justify-center h-full px-6 text-center">
      <span class="inline-block mb-4 px-4 py-1 rounded-full bg-green-100 text-green-700 font-semibold text-sm shadow">
        Version actuelle : v1.0
      </span>
      <h1 class="text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-6">
        Superchargez vos démarches avec
        <span class="text-indigo-400">IA Campus France</span>
      </h1>
      <p class="text-lg sm:text-xl text-gray-300 mb-8 max-w-2xl">
        La plateforme intelligente pour accompagner les étudiants africains dans toutes leurs démarches Campus France :
        visa, logement, lettre de motivation, CV, inscriptions, et plus encore.
      </p>
      <button
        @click="$router.push('/register')"
        class="inline-flex items-center gap-x-2 text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-blue-700 hover:to-indigo-700 font-semibold rounded-full py-3 px-6 shadow-lg transition-all duration-300"
      >
        Commencer maintenant
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  </section>
</template>
