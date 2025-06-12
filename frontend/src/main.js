import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
app.use(router)
app.use(pinia)
app.mount('#app')
