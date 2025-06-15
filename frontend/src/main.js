import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './config/axios'  // Import de la configuration axios
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)
app.mount('#app')
