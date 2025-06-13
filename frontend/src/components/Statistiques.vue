<template>
        <!-- Stats Section -->
        <div id="stats" class="py-14 bg-with-900 px-4 sm:px-10 md:mt-28 mt-20 border-b border-gray-600">
      <div class="max-w-screen-xl mx-auto">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div class="text-black text-4xl font-semibold mb-3">
              <CountUp :end="98" suffix="%" />
            </div>
            <div class="text-black text-slate-400">Taux de précision</div>
          </div>
          <div>
            <div class="text-black text-4xl font-semibold mb-3">
              <CountUp :end="10000000" suffix="M+" :format="n => (n/1000000).toFixed(0)" />
            </div>
            <div class="text-black text-slate-400">Requêtes quotidiennes</div>
          </div>
          <div>
            <div class="text-black text-4xl font-semibold mb-3">
              <CountUp :end="24" suffix="/7" />
            </div>
            <div class="text-black text-slate-400">Disponibilité</div>
          </div>
          <div>
            <div class="text-black text-4xl font-semibold mb-3">
              <CountUp :end="50" suffix="+" />
            </div>
            <div class="text-black text-slate-400">Langues supportées</div>
          </div>
        </div>
      </div>
    </div>
</template>
<script setup>
import CountUp from './CountUp.vue'
</script>
