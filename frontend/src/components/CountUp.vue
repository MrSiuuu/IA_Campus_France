<template>
    <span>{{ displayValue }}{{ suffix }}</span>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  
  const props = defineProps({
    end: { type: Number, required: true },
    duration: { type: Number, default: 1200 },
    suffix: { type: String, default: '' },
    format: { type: Function, default: null }
  })
  
  const displayValue = ref(0)
  
  function animateCountUp() {
    const start = 0
    const startTime = performance.now()
    function animate(now) {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / props.duration, 1)
      let value = Math.floor(start + (props.end - start) * progress)
      if (props.format) value = props.format(value)
      displayValue.value = value
      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        displayValue.value = props.format ? props.format(props.end) : props.end
      }
    }
    requestAnimationFrame(animate)
  }
  
  onMounted(animateCountUp)
  watch(() => props.end, animateCountUp)
  </script>