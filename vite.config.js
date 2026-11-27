import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
// the art workshop folders at the top of the project are not part of the site (src/art is)
const workshop = (p) => /^(art|reference stage|chatgpt generated[^\\/]*)([\\/]|$)/.test(relative(root, p))

export default defineConfig({
  plugins: [react()],
  build: { target: 'es2020', assetsInlineLimit: 2048 },
  // zipping or saving in the workshop folders must not stop the dev server
  server: { watch: { ignored: [workshop] } },
})
