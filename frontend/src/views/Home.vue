<template>
  <div class="bg-white text-slate-900 text-[15px] max-w-full overflow-x-hidden">
    <div id="home" class="bg-gradient-to-t from-purple-200 via-purple-100 to-white">
      <Hero />
    </div>

    <!-- Trusted By Section -->
    <div class="px-4 sm:px-10 mt-12">
      <div class="max-w-screen-xl mx-auto px-6 py-6 bg-gradient-to-l from-purple-300 via-purple-200 to-purple-100 rounded-3xl">
        <FlagCarousel />
        <h4 class="text-lg font-semibold text-center mt-12">Présent dans les pays d'Afrique de l'Ouest et du Centre</h4>
      </div>
    </div>

    <Features />
    <Pricing />
    <Statistiques />
    


    <!-- FAQ -->
    <FAQ />

    <!-- Footer -->
    <Footer />
  </div>
</template>

<script setup>
import Hero from '../components/Hero.vue'
import Features from '../components/Features.vue'
import Pricing from '../components/Pricing.vue'
import FlagCarousel from '../components/FlagCarousel.vue'
import FAQ from '../components/FAQ.vue'
import Statistiques from '../components/Statistiques.vue'
import Footer from '../components/Footer.vue'
</script> 