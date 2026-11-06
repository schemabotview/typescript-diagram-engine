// Screenshot one SVG miniflow wrote, as an image viewer shows it, for the output panel: centred on
// the canvas colour, zoomed to fit (at most MAX_ZOOM), in both themes, at EXACTLY the pixels the
// panel's body lands on in the 4K frame (scripts/frame.json), so the PNG is drawn 1:1.
// Fails when miniflow's smallest text would land under minTextPx in the frame (the plan's
// "legibility inside a screenshot": check-render cannot see inside a PNG).
//   node scripts/shoot-svg.cjs <file.svg> <out-base> <w> <h> <minTextPx>
const { chromium } = require('playwright')
const { readFileSync } = require('node:fs')
const [src, outBase, W, H, MIN] = process.argv.slice(2)
const w = +W, h = +H, min = +MIN
const MAX_ZOOM = 4
const BG = { dark: '#1a1d23', light: '#f7f8fa' }
;(async () => {
  const svg = readFileSync(src, 'utf8')
  const b = await chromium.launch()
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
  let zoom
  for (const theme of ['dark', 'light']) {
    await p.setContent(`<!doctype html><html><body style="margin:0;width:${w}px;height:${h}px;display:grid;place-items:center;background:${BG[theme]};overflow:hidden">
      <div id="v">${svg}</div></body></html>`)
    zoom = await p.evaluate(([w, h, max]) => {
      const s = document.querySelector('#v svg'), r = s.getBoundingClientRect()
      const z = Math.min(max, (0.9 * w) / r.width, (0.9 * h) / r.height)
      document.getElementById('v').style.zoom = String(z)
      return z
    }, [w, h, MAX_ZOOM])
    const font = await p.evaluate(() => Math.min(...[...document.querySelectorAll('#v text')].map((t) => parseFloat(getComputedStyle(t).fontSize))))
    if (Number.isFinite(font) && font * zoom < min) {
      console.error(`${src}: smallest text ${(font * zoom).toFixed(1)}px < ${min}px in the frame (zoom ${zoom.toFixed(2)})`)
      process.exit(1)
    }
    await p.screenshot({ path: `${outBase}.${theme}.png` })
  }
  console.log(`${src} → ${outBase}.{dark,light}.png  ${w}×${h} at ${zoom.toFixed(2)}×`)
  await b.close()
})().catch((e) => { console.error(e); process.exit(1) })
