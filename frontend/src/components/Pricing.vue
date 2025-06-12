<template>
  <div id="pricing" class="px-4 sm:px-10 md:mt-28 mt-20">
    <div class="max-w-screen-xl mx-auto">
      <div class="text-center max-w-2xl mx-auto">
        <h2 class="lg:text-4xl sm:text-3xl text-2xl font-semibold mb-6 md:!leading-[50px] leading-[40px]">
          Solutions IA pour tous les besoins
        </h2>
        <div class="mt-6">
          <p class="text-slate-500 leading-relaxed">
            Choisissez le plan IA parfait pour améliorer votre productivité, que vous soyez un étudiant individuel ou une équipe.
          </p>
        </div>
      </div>

      <div class="grid lg:grid-cols-3 md:grid-cols-2 gap-6 max-md:max-w-md max-md:mx-auto mt-16">
        <div v-for="plan in plans" :key="plan.name" class="relative bg-slate-50 rounded-3xl p-8 overflow-hidden transition-all">
          <h4 class="text-purple-700 text-lg font-medium mb-3">{{ plan.name }}</h4>
          <h3 class="text-[40px] font-semibold">{{ plan.price }}<sub class="text-slate-500 font-normal text-sm ml-1">/ mois</sub></h3>
          <div class="mt-3">
            <p class="text-slate-500 leading-relaxed">{{ plan.description }}</p>
          </div>

          <hr class="my-6 border-gray-300" />

          <div>
            <ul class="space-y-5">
              <li v-for="feature in plan.features" :key="feature" class="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" class="mr-3 bg-purple-700 fill-white rounded-full p-[3px] w-[18px] h-[18px]" viewBox="0 0 24 24">
                  <path d="M9.707 19.121a.997.997 0 0 1-1.414 0l-5.646-5.647a1.5 1.5 0 0 1 0-2.121l.707-.707a1.5 1.5 0 0 1 2.121 0L9 14.171l9.525-9.525a1.5 1.5 0 0 1 2.121 0l.707.707a1.5 1.5 0 0 1 0 2.121z" data-original="#000000" />
                </svg>
                {{ feature }}
              </li>
            </ul>

            <div class="min-h-[22px] mt-8">
              <button type="button" @click="$router.push('/register')" class="cursor-pointer absolute bottom-0 left-0 right-0 mx-auto w-full px-6 py-3.5 text-base font-medium tracking-wide bg-purple-600 hover:bg-purple-700 text-white transition-all">
                {{ plan.buttonText }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const plans = [
  {
    name: 'Étudiant',
    price: '29€',
    description: 'Parfait pour les étudiants explorant les capacités de l\'IA',
    features: [
      '10,000 mots générés par mois',
      'Génération de contenu basique',
      'Qualité de réponse standard',
      'Support par email'
    ],
    buttonText: 'Essai gratuit'
  },
  {
    name: 'Professionnel',
    price: '99€',
    description: 'Pour les professionnels et les équipes en croissance',
    features: [
      '50,000 mots générés par mois',
      'Génération de contenu avancée',
      'Qualité de réponse premium',
      'Accès API',
      'Tableau de bord analytique basique',
      'Support chat prioritaire'
    ],
    buttonText: 'Commencer'
  },
  {
    name: 'Entreprise',
    price: '199€+',
    description: 'Solutions IA sur mesure pour les grandes organisations',
    features: [
      'Génération IA illimitée',
      'Formation de modèles IA personnalisés',
      'Infrastructure dédiée',
      'Analyses avancées',
      'Support VIP 24/7'
    ],
    buttonText: 'Contactez-nous'
  }
]
</script> 