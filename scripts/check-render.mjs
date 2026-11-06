// Every section at the recording frame (3840×2160, ?capture=1), measured with graphl-flow's own
// assertions (its scripts/check.mjs, the evaluate body copied verbatim), plus this repo's frame rules:
//   - every IDE frame (a scene with an `editor`) lands on ONE fit — one scale across the film;
//   - the output panel's figure body matches scripts/frame.json, the size spine.py shoots at;
//   - every section's scene exists, and no page or console error.
// Boots its own vite on :5179.
import { readFileSync } from 'node:fs'
import puppeteer from 'puppeteer'
import { createServer } from 'vite'
import { loadRegistry } from '../node_modules/@graphlearning/shell/scripts/_paths.mjs'

const FRAME = JSON.parse(readFileSync(new URL('./frame.json', import.meta.url), 'utf8')).figure
const server = await createServer({ server: { port: 5179, strictPort: true }, logLevel: 'error' }); await server.listen()
const BASE = 'http://localhost:5179/typescript-diagram-engine/'
const b = await puppeteer.launch({ headless: true, args: ['--no-sandbox'], executablePath: process.env.PUPPETEER_EXECUTABLE_PATH })
const p = await b.newPage(); await p.setViewport({ width: 3840, height: 2160, deviceScaleFactor: 1 })
const errs = []; let at = ''
p.on('pageerror', e => errs.push(`${at}: ${e.message}`)); // A missing narration wav is not a frame error: the recorder waits for the wavs (record:all).
p.on('console', m => m.type() === 'error' && !/status of 404/.test(m.text()) && errs.push(`${at}: ${m.text()}`))
p.on('requestfailed', r => errs.push(`${at}: ${r.url()} failed`))
p.on('response', r => r.status() === 404 && !/\/audio\/|favicon/.test(r.url()) && errs.push(`${at}: 404 ${r.url()}`))
await p.goto(`${BASE}?capture=1#/`, { waitUntil: 'networkidle2' })
await p.waitForFunction(() => !!window.__scene, { timeout: 20000 }).catch(() => { console.log('FAIL the app did not start:', errs.join(' | ') || 'no error logged'); process.exit(1) })
const { COURSES } = await loadRegistry()
const plan = Object.values(COURSES).flatMap((c) => c.sections.map((x) => `${c.id}-${x.id}`))
const only = process.argv[2]
const slugs = [...new Set(plan)].filter((s) => !only || s.startsWith(only))
const BODY_MIN_PX = +(process.env.BODY_MIN_PX ?? 24), ICON_MIN_PX = +(process.env.ICON_MIN_PX ?? 32)
let fails = 0
const ideFits = new Map()
for (const slug of slugs) {
  at = slug
  await p.goto(`${BASE}?capture=1#/${slug}`, { waitUntil: 'networkidle2' })
  const missing = await p.$('.stage--missing')
  if (missing) { fails++; console.log('FAIL', slug.padEnd(18), 'no scene'); continue }
  await p.waitForSelector('.gf-scene[data-fit="ready"]', { timeout: 15000 })
  const before = await p.$eval('.gf-content', c => c.style.transform); await new Promise((r) => setTimeout(r, 300))
  await p.evaluate(([b, i]) => { window.BODY_MIN_PX = b; window.ICON_MIN_PX = i }, [BODY_MIN_PX, ICON_MIN_PX])
  const res = await p.evaluate(() => {
    const c = document.querySelector('.gf-content'), box = c.getBoundingClientRect(), s = box.width / c.offsetWidth
    const R = (el) => { const r = el.getBoundingClientRect(); return { x: (r.left - box.left) / s, y: (r.top - box.top) / s, w: r.width / s, h: r.height / s } }
    const node = (id) => document.querySelector(`[data-id="${id}"]`)
    const onFace = (pt, r) => {
      const near = (a, b) => Math.abs(a - b) < 0.01, inY = pt.y >= r.y && pt.y <= r.y + r.h, inX = pt.x >= r.x && pt.x <= r.x + r.w
      return (near(pt.x, r.x - 4) && inY) || (near(pt.x, r.x + r.w + 4) && inY) || (near(pt.y, r.y - 4) && inX) || (near(pt.y, r.y + r.h + 4) && inX)
    }
    const paths = [...document.querySelectorAll('.gf-edge')]
    const pts = (e) => e.dataset.route.slice(2).split(' L ').map((q) => q.split(',').map(Number)).map(([x, y]) => ({ x, y }))
    const len = (ps) => ps.reduce((sum, q, i) => i ? sum + Math.abs(q.x - ps[i-1].x) + Math.abs(q.y - ps[i-1].y) : 0, 0)
    const problems = []
    const all = [...document.querySelectorAll('[data-id]')]
    for (const e of paths) {
      const ps = pts(e), a = node(e.dataset.from), z = node(e.dataset.to), tag = `${e.dataset.from}->${e.dataset.to}`
      if (!ps.every((q, i) => i === 0 || q.x === ps[i - 1].x || q.y === ps[i - 1].y)) problems.push(`not orthogonal ${tag}`)
      if (!onFace(ps[0], R(a)) || !onFace(ps.at(-1), R(z))) problems.push(`off face ${tag}`)
      if (len(ps) < 24) problems.push(`short ${tag}`)
      // The DRAWN shaft (`d`, trimmed HEAD_TRIM short of each head) must run the same way as the route
      // at both ends: an end run shorter than the trim reversed it and flipped the arrowhead (0.2, three
      // arrows fanning into one node through one gap — edge-fan-in).
      const drawn = e.getAttribute('d').slice(2).split(' L ').map((q) => q.split(',').map(Number)).map(([x, y]) => ({ x, y }))
      const dir = (p0, p1) => [Math.sign(Math.round((p1.x - p0.x) * 100)), Math.sign(Math.round((p1.y - p0.y) * 100))].join()
      if (dir(ps.at(-2), ps.at(-1)) !== dir(drawn.at(-2), drawn.at(-1)) || dir(ps[0], ps[1]) !== dir(drawn[0], drawn[1])) problems.push(`flipped head ${tag}`)
      // A row end must leave its TABLE, not just its row: a row narrower than its frame starts the
      // arrow inside the border (title wider than the cells, in memory-hashmap).
      for (const [el, pt] of [[a, ps[0]], [z, ps.at(-1)]]) {
        const t = el.tagName === 'TR' && el.closest('.gf-table')
        if (t) { const r = R(t); if (pt.x > r.x && pt.x < r.x + r.w) problems.push(`${tag} ends inside table ${t.dataset.id}`) }
      }
      // A segment may cross ancestors/descendants of its ends, never an unrelated node's interior.
      for (const n of all) {
        if (n.contains(a) || n.contains(z) || a.contains(n) || z.contains(n)) continue
        const r = R(n)
        const cuts = ps.some((q, i) => i > 0 && (() => {
          const p0 = ps[i - 1], x0 = Math.min(p0.x, q.x), x1 = Math.max(p0.x, q.x), y0 = Math.min(p0.y, q.y), y1 = Math.max(p0.y, q.y)
          return x0 < r.x + r.w - 1 && x1 > r.x + 1 && y0 < r.y + r.h - 1 && y1 > r.y + 1
        })())
        if (cuts) problems.push(`${tag} crosses ${n.dataset.id}`)
      }
    }
    // A terminal row is one row tall even when blank, and a screen's rows are all the same width: a
    // row is a flex container, which DROPS whitespace-only text, so a blank row collapsed and a run of
    // leading spaces vanished (0.7: Debian's login banner lost its blank lines, man's indent was gone).
    for (const line of document.querySelectorAll('.gf-code[data-console] .gf-line, .gf-code[data-terminal] .gf-line, .gf-tty .gf-line')) {
      const lh = parseFloat(getComputedStyle(line).lineHeight)
      if (line.getBoundingClientRect().height / s < lh - 0.5) problems.push(`collapsed row ${line.dataset.id ?? line.closest('[data-id]').dataset.id}`)
    }
    for (const tty of document.querySelectorAll('.gf-tty')) {
      const width = (l) => { const r = document.createRange(); r.selectNodeContents(l); return Math.round(r.getBoundingClientRect().width / s) }
      const widths = [...tty.querySelectorAll('.gf-line')].map(width)
      if (new Set(widths).size > 1) problems.push(`tty ${tty.dataset.id}: rows of different widths ${[...new Set(widths)].join('/')}`)
    }
    // A figure is a screenshot: it must have loaded, and must never be drawn LARGER than its image
    // in the 4K frame — an upscaled screenshot is blurry text. `contain` fits it inside its box, so
    // the drawn scale is the smaller of the two ratios (0.11).
    for (const img of document.querySelectorAll('img[data-figure]')) {
      const id = img.dataset.figure
      if (!img.complete || !img.naturalWidth) { problems.push(`figure ${id} did not load`); continue }
      const r = img.getBoundingClientRect(), k = Math.min(r.width / img.naturalWidth, r.height / img.naturalHeight)
      const fit = `shoot it at ${Math.ceil(r.width)}×${Math.ceil(r.height)}`
      if (k > 1.005) problems.push(`figure ${id} drawn at ${k.toFixed(2)}× its ${img.naturalWidth}×${img.naturalHeight} image: ${fit}`)
      // A screenshot of another shape is letterboxed: an empty strip along one side of the window.
      const gap = Math.max((r.width - img.naturalWidth * k) / r.width, (r.height - img.naturalHeight * k) / r.height)
      if (gap > 0.005) problems.push(`figure ${id} letterboxed (${(gap * 100).toFixed(1)}% empty): ${fit}`)
    }
    // Plot text is placed by counted gutters, not by layout: every <text> must sit inside its SVG,
    // or a miscount clips a tick or a label silently (the SVG is overflow: hidden).
    for (const svg of document.querySelectorAll('.gf-plot svg')) {
      const r = svg.getBoundingClientRect()
      for (const t of svg.querySelectorAll('text')) {
        const b = t.getBoundingClientRect()
        if (b.left < r.left - 0.5 || b.right > r.right + 0.5 || b.top < r.top - 0.5 || b.bottom > r.bottom + 0.5)
          problems.push(`plot ${svg.closest('[data-id]').dataset.id} clips text "${t.textContent}"`)
      }
    }
    // Arrowheads on ONE face must sit at least a head's width (10) apart, or they pile into one blob:
    // four arrows into a ~50px card spread their ports ~6px apart (edge-fan-in-h before its sink was
    // made taller). The router cannot make room without growing the node — aim at a taller one.
    const heads = []
    for (const e of paths) {
      const ps = pts(e)
      heads.push({ at: ps.at(-1), id: e.dataset.to })
      if (e.hasAttribute('marker-start')) heads.push({ at: ps[0], id: e.dataset.from })
    }
    for (let i = 0; i < heads.length; i++) for (let j = i + 1; j < heads.length; j++) {
      const a = heads[i], b = heads[j]
      if (a.id === b.id && (Math.abs(a.at.x - b.at.x) < 0.01 || Math.abs(a.at.y - b.at.y) < 0.01) && Math.hypot(a.at.x - b.at.x, a.at.y - b.at.y) < 10)
        problems.push(`arrowheads crowd on ${a.id}`)
    }
    const ls = [...document.querySelectorAll('.gf-edge-label')].map((l) => l.getBoundingClientRect())
    const hit = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    if (ls.some((a, i) => ls.some((b, j) => j > i && hit(a, b)))) problems.push('labels overlap')
    // A label may sit only on its OWN edge: another edge running under it reads as one line (Spark's
    // dashed back edge passed under the 'tasks' label once spread moved its end).
    for (const l of document.querySelectorAll('.gf-edge-label')) {
      const lr = l.getBoundingClientRect()
      for (const e of paths.filter((e) => e.dataset.edge !== l.dataset.edge)) {
        const ps = pts(e).map((q) => ({ x: box.left + q.x * s, y: box.top + q.y * s }))
        const under = ps.some((q, i) => i > 0 && Math.min(ps[i - 1].x, q.x) < lr.right && Math.max(ps[i - 1].x, q.x) > lr.left
          && Math.min(ps[i - 1].y, q.y) < lr.bottom && Math.max(ps[i - 1].y, q.y) > lr.top)
        if (under) problems.push(`edge ${e.dataset.from}->${e.dataset.to} runs under label "${l.textContent}"`)
      }
    }
    if (ls.some((l) => [...document.querySelectorAll('.gf-item')].some((n) => hit(l, n.getBoundingClientRect())))) problems.push('label on node')
    // LEGIBILITY on video: the smallest text people must read, and the smallest item icon, measured in
    // the 4K frame. 24px is 12px at 1080p. A scene denser than this fails like an overflow does —
    // split it or trim it (Barclays read at 20px before the type scale and reading measure).
    const BODY = '.gf-item-title, .gf-item-sub, .gf-bullets li, .gf-table td, .gf-line, .gf-tree-name, .gf-note, .gf-edge-label, .gf-cell-n'
    const minBody = Math.min(...[...document.querySelectorAll(BODY)].filter((e) => e.textContent.trim()).map((e) => parseFloat(getComputedStyle(e).fontSize) * s))
    if (minBody < window.BODY_MIN_PX) problems.push(`body text ${minBody.toFixed(1)}px < ${window.BODY_MIN_PX}px at 4K`)
    const minIcon = Math.min(...[...document.querySelectorAll('.gf-item > .gf-icon')].map((e) => e.getBoundingClientRect().height))
    if (minIcon < window.ICON_MIN_PX) problems.push(`item icon ${minIcon.toFixed(1)}px < ${window.ICON_MIN_PX}px at 4K`)
    const over = [...document.querySelectorAll('.gf-scene *')].filter(e => !(e instanceof SVGElement) && getComputedStyle(e).display !== 'inline' && e.scrollWidth > e.clientWidth + 1)
    if (over.length) problems.push(`overflow x${over.length}`)
    const cr = c.getBoundingClientRect(), pr = document.querySelector('.gf-scene').getBoundingClientRect()
    if (cr.left < pr.left - 0.5 || cr.right > pr.right + 0.5 || cr.top < pr.top - 0.5 || cr.bottom > pr.bottom + 0.5) problems.push('content outside frame')
    return { drawn: paths.length, problems }
  })
  if (before !== await p.$eval('.gf-content', c => c.style.transform)) res.problems.push('fit moved after ready')
  const ide = await p.$('[data-id="editor"]')
  if (ide) ideFits.set(slug, before)
  const fig = await p.evaluate(() => { const i = document.querySelector('img[data-figure="output"]'); if (!i) return null; const r = i.getBoundingClientRect(); return { w: r.width, h: r.height } })
  if (fig && (Math.abs(fig.w - FRAME.w) > 1 || Math.abs(fig.h - FRAME.h) > 1))
    res.problems.push(`output panel body is ${fig.w.toFixed(1)}×${fig.h.toFixed(1)}, frame.json shoots ${FRAME.w}×${FRAME.h}`)
  if (res.problems.length) fails++
  console.log(res.problems.length ? 'FAIL' : 'ok  ', slug.padEnd(18), `edges ${res.drawn}`, res.problems.join('; '))
}
const fits = new Set(ideFits.values())
if (fits.size > 1) { fails++; console.log('FAIL IDE frames land on', fits.size, 'fits:', [...ideFits].map(([s, f]) => `${s} ${f}`).join(' | ')) }
for (const e of errs) console.log('FAIL page error', e)
console.log(fails || errs.length ? `FAILED: ${fails} section(s), ${errs.length} page error(s)` : `ALL OK: ${slugs.length} sections, ${ideFits.size} IDE frames on one fit`)
await b.close(); await server.close()
process.exit(fails || errs.length ? 1 : 0)
