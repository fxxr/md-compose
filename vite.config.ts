/// <reference types="vitest/config" />
import {defineConfig} from 'vite'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/guide/build.html#library-mode
export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      name: 'md-compose',
      formats: ['es'],
      fileName: 'md-compose',
    },
    rollupOptions: {
      external: [
        // Externalize all Node.js built-in modules
        /^node:.*/,
      ]
    },
    minify: false,
  },
  plugins: [dts({include: 'src/index.ts'})],
})