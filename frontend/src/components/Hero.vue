<template>
  <div class="px-2 sm:px-6 py-4">
    <div class="grid grid-cols-1 xl:grid-cols-2 justify-center items-center gap-6 xl:gap-10">
      <div>
        <div class="max-w-3xl mx-auto text-center xl:text-left">
          <h1 class="lg:text-6xl md:text-5xl text-3xl font-semibold lg:!leading-[75px] md:!leading-[65px] leading-[40px]">
            Superchargez vos démarches avec notre Assistant IA Campus France
          </h1>
          <p class="text-base leading-relaxed mt-4">
            Notre assistant IA n'est pas qu'un simple outil d'intelligence artificielle—c'est votre partenaire cognitif, conçu pour révolutionner vos démarches administratives, vos créations et vos décisions. Propulsé par des modèles d'apprentissage automatique de pointe et entraîné sur de vastes ensembles de données.
          </p>
        </div>

        <div class="mt-8 flex flex-wrap gap-x-4 gap-y-3 justify-center xl:justify-start">
          <button @click="$router.push('/register')" class="cursor-pointer px-6 py-3 text-base rounded-full font-medium tracking-wide text-white border border-purple-600 bg-purple-600 hover:bg-purple-700 transition-all">
            Commencer
          </button>
        </div>

        <div class="flex items-center flex-wrap justify-center xl:justify-start gap-3 mt-6">
          <div class="flex -space-x-2">
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white" />
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white" />
            <img src="/images/81vbpm8wdml-_ac_sl1500_.webp" alt="Avatar" class="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white" />
          </div>
          <div class="text-slate-500 text-sm md:text-base">
            <span class="font-semibold">10,000+</span> étudiants nous font confiance
          </div>
        </div>
      </div>

      <div class="w-full mt-8 xl:mt-0">
        <img src="/images/pc-gamer-wall.jpg" alt="Hero Image" class="w-full h-48 sm:h-64 md:h-80 xl:h-full object-cover rounded-lg" />
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