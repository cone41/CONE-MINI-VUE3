import { createApp } from '../../lib/cone-mini-vue.esm.js'
import App from './App.js'

const rootContainer = document.querySelector('#app')
createApp(App).mount(rootContainer)