<template>
  <div class="px-4 sm:px-10 py-6 mt-[70px]">
    <div class="grid xl:grid-cols-2 justify-center items-center gap-10">
      <div>
        <div class="max-w-3xl max-xl:mx-auto max-xl:text-center">
          <h1 class="lg:text-6xl md:text-5xl text-4xl font-semibold lg:!leading-[75px] md:!leading-[65px] leading-[55px]">
            Superchargez vos démarches avec notre Assistant IA Campus France
          </h1>
          <p class="text-base leading-relaxed mt-6">
            Notre assistant IA n'est pas qu'un simple outil d'intelligence artificielle—c'est votre partenaire cognitif, conçu pour révolutionner vos démarches administratives, vos créations et vos décisions. Propulsé par des modèles d'apprentissage automatique de pointe et entraîné sur de vastes ensembles de données.
          </p>
        </div>

        <div class="mt-12 flex flex-wrap gap-x-6 gap-y-4 max-xl:justify-center">
          <button @click="$router.push('/register')" class="cursor-pointer px-6 py-3 text-base rounded-full font-medium tracking-wide text-white border border-purple-600 bg-purple-600 hover:bg-purple-700 transition-all">
            Commencer
          </button>
          <button @click="scrollToFeatures" class="cursor-pointer px-6 py-3 text-base rounded-full font-medium tracking-wide border border-slate-900 bg-transparent hover:border-purple-600 transition-all">
            En savoir plus
          </button>
        </div>

        <div class="flex items-center flex-wrap max-xl:justify-center gap-4 mt-8">
          <div class="flex -space-x-2">
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-white" />
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-white" />
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-10 h-10 rounded-full border-2 border-white" />
          </div>
          <div class="text-slate-500">
            <span class="font-semibold">10,000+</span> étudiants nous font confiance
          </div>
        </div>
      </div>

      <div class="xl:aspect-[8/7] sm:aspect-[10/7] w-full">
        <img src="/images/pc-gamer-wall.jpg" alt="Hero Image" class="w-full h-full object-cover" />
      </div>
    </div>
  </div>
</template>

<script setup>
const scrollToFeatures = () => {
  const featuresSection = document.getElementById('features')
  if (featuresSection) {
    featuresSection.scrollIntoView({ behavior: 'smooth' })
  }
}
</script> 