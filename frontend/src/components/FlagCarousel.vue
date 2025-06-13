<template>
  <div class="relative w-full flex flex-col items-center" style="height: 90px;">
    <div class="flex items-center justify-center w-full gap-8">
      <div v-for="(flag, index) in flags" :key="index" class="inline-flex flex-col items-center group">
        <img :src="flag.image" class="flag-img group-hover:bounce" :alt="`Drapeau du ${flag.name}`" />
        <span class="text-sm font-medium mt-2">{{ flag.name }}</span>
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
  width: 96px;
  height: 64px;
  object-fit: contain;
  display: block;
  transition: transform 0.3s cubic-bezier(.68,-0.55,.27,1.55);
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