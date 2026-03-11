import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages でもそのまま開けるように相対パスで出力
export default defineConfig({
  base: './',
  plugins: [react()],
})
