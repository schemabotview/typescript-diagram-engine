// One 4K PNG per section of a course (or `--only id,id`), ?capture=1, at the recording frame.
// The shell's graphl-shots-4k reads window.__scene.plan() from the catalog, which lists only the
// FIRST course, so this walks the registry instead and boots its own vite (:5181), which it stops.
//   node scripts/shots.mjs <course> [--only id[,id]] [--theme dark|light]
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import puppeteer from 'puppeteer'
import { createServer } from 'vite'
import { loadRegistry, dataDir } from '../node_modules/@graphlearning/shell/scripts/_paths.mjs'

const course = process.argv[2]
if (!course) { console.error('usage: shots <course> [--only id,id]'); process.exit(2) }
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : undefined }
const only = (arg('--only') ?? '').split(',').filter(Boolean)
const { COURSES } = await loadRegistry()
const c = COURSES[course]
if (!c) { console.error(`no course ${course}`); process.exit(2) }
const out = join(dataDir, 'out', 'shots-4k', course)
mkdirSync(out, { recursive: true })
const server = await createServer({ server: { port: 5181, strictPort: true }, logLevel: 'error' }); await server.listen()
const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.PUPPETEER_EXECUTABLE_PATH })
const p = await b.newPage(); await p.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 })
let n = 0
for (const [i, s] of c.sections.entries()) {
  if (only.length && !only.includes(s.id)) continue
  await p.goto(`http://localhost:5181/typescript-diagram-engine/?capture=1#/${course}-${s.id}`, { waitUntil: 'networkidle2' })
  await p.waitForSelector('.gf-scene[data-fit="ready"]', { timeout: 15000 })
  await new Promise((r) => setTimeout(r, 600))
  const f = join(out, `${String(i + 1).padStart(2, '0')}-${s.id}.png`)
  await p.screenshot({ path: f }); n++
  console.log(' ', f)
}
await b.close(); await server.close()
console.log(`${n} shots in ${out}`)
