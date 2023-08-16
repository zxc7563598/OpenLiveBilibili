import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 引入路由
import router from './router/index'


const app = createApp(App)
// 使用路由
app.use(router).mount('#app')