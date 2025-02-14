import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js';//Import Router

const app = createApp(App);
app.use(router);
app.mount('#app');
