import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('.', import.meta.url))
// the art workshop folders at the top of the project are not part of the site (src/art is), and neither is
// anything else outside src and public, such as a download still being saved (a locked file stops the watcher)
const workshop = (p) => {
  const r = relative(root, p)
  return /\.(crdownload|part|tmp)$/i.test(r) || /^(?!src[\\/]|public[\\/]|index\.html$|vite\.config\.js$|package\.json$)[^\\/]+[\\/]/.test(r)
}

// a shared link's preview needs the picture's full address. On Vercel the production domain is known at build
// time; SITE_URL (set in Vercel's settings) wins, for a custom domain. Without either the links stay relative.
const site = (process.env.SITE_URL
  || (process.env.VERCEL_PROJECT_PRODUCTION_URL && `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
  || (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`)
  || '').replace(/\/$/, '')
const shareCard = { name: 'share-card', transformIndexHtml: (html) => html.replaceAll('%SITE%', site) }

export default defineConfig({
  plugins: [react(), shareCard],
  build: { target: 'es2020', assetsInlineLimit: 2048 },
  // zipping or saving in the workshop folders must not stop the dev server
  server: { watch: { ignored: [workshop] } },
})
