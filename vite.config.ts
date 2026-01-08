import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import vue from '@vitejs/plugin-vue'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import sveltePreprocess from 'svelte-preprocess'

export default defineConfig({
  base: '/multi_dashboard/',
  plugins: [
    react(),
    vue(),
    svelte({
      preprocess: sveltePreprocess(),
    }),
  ],
})
