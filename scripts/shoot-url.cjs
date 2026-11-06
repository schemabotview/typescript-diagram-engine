// Screenshot miniflow's live page from the step's real dev server, for the output panel: at exactly
// the panel body's pixel size (scripts/frame.json), as a browser at ZOOM shows it (deviceScaleFactor,
// so CSS px land ZOOM times larger and the PNG stays 1:1 in the frame). Two shots: as the page loads
// (dark), and after clicking its #theme button when it has one (light). Fails when the page's
// smallest text would land under minTextPx in the frame.
//   node scripts/shoot-url.cjs <url> <out-base> <w> <h> <minTextPx>
const { chromium } = require('playwright')
const [url, outBase, W, H, MIN] = process.argv.slice(2)
const ZOOM = 1.6
;(async () => {
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: Math.round(+W / ZOOM), height: Math.round(+H / ZOOM) }, deviceScaleFactor: ZOOM })
  const errors = []
  p.on('pageerror', (e) => errors.push(e.message))
  await p.goto(url, { waitUntil: 'networkidle' })
  await p.waitForTimeout(500)
  const smallest = async () => p.evaluate(() => {
    const texts = [...document.querySelectorAll('body *')].filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
    return Math.min(...texts.map((e) => {
      const r = e.getBoundingClientRect(), fs = parseFloat(getComputedStyle(e).fontSize)
      // An SVG scaled by a transform draws its text at fontSize × the element's on-screen scale.
      const svg = e.closest('svg'), k = svg && svg.viewBox?.baseVal?.width ? svg.getBoundingClientRect().width / svg.viewBox.baseVal.width : 1
      return r.width ? fs * k : Infinity
    }))
  })
  const check = async () => {
    const px = (await smallest()) * ZOOM
    if (Number.isFinite(px) && px < +MIN) { console.error(`${url}: smallest text ${px.toFixed(1)}px < ${MIN}px in the frame`); process.exit(1) }
    return px
  }
  const px = await check()
  await p.screenshot({ path: `${outBase}.dark.png` })
  const toggle = await p.$('#theme')
  if (toggle) { await toggle.click(); await p.waitForTimeout(300); await check() }
  await p.screenshot({ path: `${outBase}.light.png` })
  if (errors.length) { console.error(`${url}: page errors: ${errors.join(' | ')}`); process.exit(1) }
  console.log(`${url} → ${outBase}.{dark,light}.png at ${ZOOM}x, smallest text ${px.toFixed(1)}px${toggle ? ', light after #theme' : ''}`)
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
