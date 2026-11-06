import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Published at graphl.in/typescript-diagram-engine/. The spine (project files, transcripts, shots)
// is imported straight from spine/ by the scenes: nothing on screen is copied by hand.
export default defineConfig({
  base: '/typescript-diagram-engine/',
  plugins: [react()],
  server: { port: 5173 },
})
