<template>
  <div class="relative w-full flex flex-col items-center overflow-x-auto" style="height: 90px;">
    <div class="flex items-center justify-center w-full gap-3 sm:gap-6 md:gap-8 min-w-max">
      <div v-for="(flag, index) in flags" :key="index" class="inline-flex flex-col items-center group">
        <img :src="flag.image" class="flag-img group-hover:bounce" :alt="`Drapeau du ${flag.name}`" />
        <span class="text-xs sm:text-sm font-medium mt-1 sm:mt-2">{{ flag.name }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const flags = [
  { name: 'Mali', image: '/images/mali.png' },
  { name: 'Côte d\'Ivoire', image: '/images/civ.png' },
  { name: 'Bénin', image: '/images/benin.png' },
  { name: 'Togo', image: '/images/togo.png' },
  { name: 'Sénégal', image: '/images/senegal.png' },
  { name: 'Guinée', image: '/images/guinee.png' },
  { name: 'Cameroun', image: '/images/cameroun.png' }
]
</script>

<style scoped>
.flag-img {
  width: 56px;
  height: 36px;
  object-fit: contain;
  display: block;
  transition: transform 0.3s cubic-bezier(.68,-0.55,.27,1.55);
}
@media (min-width: 640px) {
  .flag-img {
    width: 80px;
    height: 54px;
  }
}
@media (min-width: 768px) {
  .flag-img {
    width: 96px;
    height: 64px;
  }
}
.group:hover .flag-img {
  animation: bounce 0.5s;
}
@keyframes bounce {
  0%   { transform: translateY(0); }
  30%  { transform: translateY(-18px); }
  50%  { transform: translateY(0); }
  70%  { transform: translateY(-9px); }
  100% { transform: translateY(0); }
}
</style> 