import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import toml from 'toml'
import fs from 'fs'

const secrets = toml.parse(fs.readFileSync('./secrets.toml', 'utf-8'))
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
   'import.meta.env.GEMINI_API_KEY': JSON.stringify(secrets.GEMINI_API_KEY),
  },
})
