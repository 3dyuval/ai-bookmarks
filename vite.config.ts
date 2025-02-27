import { defineConfig } from 'vite'
import vuetify from 'vite-plugin-vuetify';
import vue from '@vitejs/plugin-vue'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    vue(),
    vuetify(),
    crx({ manifest }),
  ],
})