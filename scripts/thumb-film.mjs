#!/usr/bin/env node
// The YouTube thumbnail for the single full-course film (scripts/out/film.mp4). Ported from
// python-expense-tracker's thumb-film.mjs.
//
// Not the shell's `graphl-thumb`: that template is a PER-COURSE poster (58% scene + panel), and a
// cropped 16:9 video frame turns to mush at the ~168px the mobile feed actually renders. A film
// cover needs poster grammar — few elements, enormous type, one focal object.
//
// The focal object is REAL: the picture the finished miniflow draws of itself (spine intro/01-file,
// shot by spine.py), under the command line cut out of that step's session.txt. The thumbnail
// cannot promise an app the course does not build.

import { mkdirSync, readFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, dirname, isAbsolute } from 'node:path'
import { execFile } from 'node:child_process'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const repoDir = process.cwd()
const FFMPEG = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg'].find(existsSync) ?? 'ffmpeg'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const SCALE = 2
const W = 1280 * SCALE
const H = 720 * SCALE

// ── the real output ─────────────────────────────────────────────────────────────────────────────
const STEP = join(repoDir, 'spine', 'intro', '01-file')
const PROMPT = 'ana@laptop:~/miniflow$ '
const COLS = 72 // spine.py cuts a longer row into rows, as the IDE terminal wraps it

/** The render command and what it printed, with spine.py's 72-column wrapping undone. */
function realRender(shotTheme) {
  const rows = readFileSync(join(STEP, 'session.txt'), 'utf8').split('\n')
  const lines = []
  for (let i = 0; i < rows.length; i++) {
    let line = rows[i]
    while (rows[i].length === COLS && i + 1 < rows.length) line += rows[++i]
    lines.push(line.trimEnd())
  }
  const at = lines.findIndex((l) => l.startsWith(PROMPT) && /\brender\b.*--svg/.test(l))
  if (at < 0) throw new Error(`no 'render … --svg' command in ${STEP}/session.txt`)
  const cmd = lines[at].slice(PROMPT.length)
  const said = lines[at + 1] ?? ''
  if (!/^wrote /.test(said)) throw new Error(`the render printed "${said}", not "wrote …"`)
  const svg = cmd.match(/--svg (\S+)/)[1]
  const shot = join(STEP, 'shots', `${svg.replace(/\//g, '-')}.${shotTheme}.png`)
  if (!existsSync(shot)) throw new Error(`no shot ${shot} — npm run spine -- record intro/01-file`)
  return { cmd, said, shot }
}

// ── the page ────────────────────────────────────────────────────────────────────────────────────
const fontFace = (fam, weight, file) => {
  const b64 = readFileSync(join(repoDir, 'node_modules', '@fontsource', fam, 'files', file)).toString('base64')
  return `@font-face{font-family:'${fam === 'ibm-plex-mono' ? 'IBM Plex Mono' : 'IBM Plex Sans'}';`
    + `font-weight:${weight};font-style:normal;font-display:block;`
    + `src:url(data:font/woff2;base64,${b64}) format('woff2')}`
}

// The accent is the repo's --brand (src/theme.css) family; the card is dark in every theme, like
// the scenes' IDE frame.
const THEMES = {
  dark:  { badgeInk: '#0b1330', bg: '#0b1330', card: '#141a24', ink: '#ffffff', accent: '#4d9de0', rule: 'rgba(255,255,255,.14)',
           glow: 'radial-gradient(118% 104% at 12% 20%, #235a97 0%, #0b1330 62%)' },
  navy:  { badgeInk: '#0f141a', bg: '#0f141a', card: '#182434', ink: '#ffffff', accent: '#ffd43b', rule: 'rgba(255,255,255,.12)',
           glow: 'radial-gradient(130% 110% at 85% 15%, #1d3a5c 0%, #0f141a 62%)' },
  light: { badgeInk: '#ffffff', bg: '#f4f6fa', card: '#1a1d23', ink: '#0d1220', accent: '#235a97', rule: 'rgba(0,0,0,.12)',
           glow: 'radial-gradient(120% 120% at 10% 8%, #ffffff 0%, #e7ecf5 70%)' },
}

/**
 * The TypeScript logo, unaltered: simple-icons' path (CC0, arrives with graphl-flow) in the brand's
 * #3178C6, over a white square so the knocked-out "TS" reads white. It is Microsoft's trademark —
 * typescriptlang.org/branding governs its use. `--mark glyph` is our own `<T>`, which needs no one's
 * permission: a type parameter is the most TypeScript thing on any screen and belongs to nobody.
 */
function markSvg(t, theme, mark) {
  if (mark === 'logo') {
    const raw = readFileSync(join(repoDir, 'node_modules', 'simple-icons', 'icons', 'typescript.svg'), 'utf8')
    const d = raw.match(/ d="([^"]+)"/)?.[1]
    if (!d) throw new Error('no path in simple-icons/icons/typescript.svg')
    return `<svg class="logo" viewBox="0 0 24 24" role="img" aria-label="TypeScript"
      xmlns="http://www.w3.org/2000/svg"><rect x="2" y="8" width="21" height="15" fill="#ffffff"/>
      <path d="${d}" fill="#3178c6"/></svg>`
  }
  const ink = theme === 'light' ? t.accent : '#ffffff'
  return `<svg class="logo" viewBox="0 0 64 64" role="img" aria-label="TypeScript — GraphL"
    xmlns="http://www.w3.org/2000/svg">
    <path d="M18 14 L4 32 L18 50 M46 14 L60 32 L46 50" fill="none" stroke="${ink}"
      stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M21 19 H43 M32 19 V48" fill="none" stroke="${t.accent}" stroke-width="7" stroke-linecap="round"/>
  </svg>`
}

function pageHtml({ render, theme, head1, head2, badge, sub, mark }) {
  const t = THEMES[theme]
  const fonts = [
    fontFace('ibm-plex-sans', 700, 'ibm-plex-sans-latin-700-normal.woff2'),
    fontFace('ibm-plex-sans', 600, 'ibm-plex-sans-latin-600-normal.woff2'),
    fontFace('ibm-plex-mono', 400, 'ibm-plex-mono-latin-400-normal.woff2'),
  ].join('')
  const img = `data:image/png;base64,${readFileSync(render.shot).toString('base64')}`

  return `<style>
  ${fonts}
  *{box-sizing:border-box;margin:0;padding:0}
  html,body{width:${W}px;height:${H}px;overflow:hidden}
  body{background:${t.bg};background-image:${t.glow};
       font-family:'IBM Plex Sans',system-ui,sans-serif;color:${t.ink};
       display:flex;align-items:stretch;gap:${36 * SCALE}px;padding:${46 * SCALE}px ${50 * SCALE}px}

  .left{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center}
  .logo{width:${96 * SCALE}px;height:${96 * SCALE}px;display:block;margin-bottom:${22 * SCALE}px;flex:0 0 auto}
  .h{font-weight:700;line-height:.86;letter-spacing:-.05em;font-size:${100 * SCALE}px;white-space:nowrap}
  .h2{color:${t.accent}}
  .sub{margin-top:${18 * SCALE}px;font-weight:600;font-size:${36 * SCALE}px;letter-spacing:-.01em;
       line-height:1.1;white-space:nowrap;opacity:.92}
  .badge{align-self:flex-start;margin-top:${24 * SCALE}px;padding:${11 * SCALE}px ${24 * SCALE}px;
         background:${t.accent};border-radius:${12 * SCALE}px;
         font-weight:700;font-size:${32 * SCALE}px;letter-spacing:.06em;color:${t.badgeInk}}

  .card{flex:1;min-width:0;background:${t.card};border:${1 * SCALE}px solid ${t.rule};
        border-radius:${18 * SCALE}px;padding:${24 * SCALE}px ${26 * SCALE}px ${20 * SCALE}px;
        display:flex;flex-direction:column;box-shadow:0 ${22 * SCALE}px ${64 * SCALE}px rgba(0,0,0,.5)}
  .dots{display:flex;gap:${9 * SCALE}px;margin-bottom:${16 * SCALE}px}
  .dots i{width:${13 * SCALE}px;height:${13 * SCALE}px;border-radius:50%}
  .cmd{font-family:'IBM Plex Mono',monospace;font-size:${19 * SCALE}px;line-height:1.3;
       color:rgba(255,255,255,.66);padding-left:1.2em;text-indent:-1.2em}
  .cmd b{color:#6ee787;font-weight:400}
  .cmd span{white-space:nowrap}
  .pic{flex:1;min-height:0;display:flex;align-items:center;justify-content:center}
  .pic img{max-width:100%;max-height:100%;display:block}
  .foot{white-space:nowrap;font-family:'IBM Plex Mono',monospace;font-size:${20 * SCALE}px;
        color:rgba(255,255,255,.45);letter-spacing:.02em}
</style>
<div class="left">
  ${markSvg(t, theme, mark)}
  <div class="h">${esc(head1)}</div>
  <div class="h h2">${esc(head2)}</div>
  <div class="sub">${sub.split('|').map(esc).join('<br>')}</div>
  <div class="badge">${esc(badge)}</div>
</div>
<div class="card">
  <div class="dots"><i style="background:#ff5f57"></i><i style="background:#febc2e"></i><i style="background:#28c840"></i></div>
  <div class="cmd">$ <b>${render.cmd.split(' ').map((w) => `<span>${esc(w)}</span>`).join(' ')}</b></div>
  <div class="pic"><img src="${img}" alt=""></div>
  <div class="foot">${esc(render.said)} · miniflow draws itself</div>
</div>`
}

// ── render ──────────────────────────────────────────────────────────────────────────────────────
async function main() {
  const argv = process.argv.slice(2)
  const opt = { theme: 'dark', out: 'output/thumbnails/film.png', mark: 'logo',
                head1: 'LEARN', head2: 'TYPESCRIPT', sub: 'by building a diagram engine', badge: 'FULL COURSE' }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--theme') opt.theme = argv[++i]
    else if (a === '--out') opt.out = argv[++i]
    else if (a === '--head1') opt.head1 = argv[++i]
    else if (a === '--head2') opt.head2 = argv[++i]
    else if (a === '--sub') opt.sub = argv[++i]
    else if (a === '--badge') opt.badge = argv[++i]
    else if (a === '--mark') opt.mark = argv[++i]
    else { console.error(`unknown argument: ${a}`); process.exit(2) }
  }
  if (!['logo', 'glyph'].includes(opt.mark)) { console.error(`unknown mark: ${opt.mark} (have: logo, glyph)`); process.exit(2) }
  if (!THEMES[opt.theme]) { console.error(`unknown theme: ${opt.theme} (have: ${Object.keys(THEMES).join(', ')})`); process.exit(2) }

  // The card is dark in every theme, so it always carries the dark shot.
  const render = realRender('dark')
  console.log(`Real render from spine: $ ${render.cmd}\n  ${render.said}\n  ${render.shot.slice(repoDir.length + 1)}`)

  const requireFromRepo = createRequire(join(repoDir, 'package.json'))
  const { default: puppeteer } = await import(pathToFileURL(requireFromRepo.resolve('puppeteer')).href)

  const browser = await puppeteer.launch({ headless: true,
    defaultViewport: { width: W, height: H, deviceScaleFactor: 1 }, args: [`--window-size=${W},${H}`] })
  try {
    const page = await browser.newPage()
    await page.setContent(pageHtml({ render, ...opt }), { waitUntil: 'load' })
    await page.evaluate(() => document.fonts.ready)
    await sleep(250)

    // The shot is the whole output panel: crop it to the drawing (anything off the corner's
    // colour, plus a margin), so the picture fills the card instead of its own padding.
    await page.evaluate(() => {
      const img = document.querySelector('.pic img')
      const c = document.createElement('canvas')
      c.width = img.naturalWidth; c.height = img.naturalHeight
      const g = c.getContext('2d')
      g.drawImage(img, 0, 0)
      const { data } = g.getImageData(0, 0, c.width, c.height)
      const bg = data.slice(0, 3)
      let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0
      for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4
        if (Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2]) > 24) {
          if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y
        }
      }
      const m = 24
      x0 = Math.max(0, x0 - m); y0 = Math.max(0, y0 - m)
      x1 = Math.min(c.width, x1 + m); y1 = Math.min(c.height, y1 + m)
      const out = document.createElement('canvas')
      out.width = x1 - x0; out.height = y1 - y0
      out.getContext('2d').drawImage(c, x0, y0, out.width, out.height, 0, 0, out.width, out.height)
      document.querySelector('.card').style.background = `rgb(${bg.join(',')})`
      return new Promise((done) => { img.onload = done; img.src = out.toDataURL('image/png') })
    })

    const overflow = await page.evaluate(() => {
      const bad = []
      for (const sel of ['.card', '.left', 'body', '.cmd']) {
        const el = document.querySelector(sel)
        if (el && (el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1)) {
          bad.push(`${sel} ${el.scrollWidth}x${el.scrollHeight} > ${el.clientWidth}x${el.clientHeight}`)
        }
      }
      // any element whose edge runs past the viewport is clipped
      for (const el of document.querySelectorAll('.h,.sub,.badge,.cmd,.foot,.pic img')) {
        const r = el.getBoundingClientRect()
        if (r.right > window.innerWidth + 1 || r.bottom > window.innerHeight + 1) {
          bad.push(`clipped: "${el.textContent.trim().slice(0, 18)}" right=${Math.round(r.right)}`)
        }
      }
      return bad
    })
    if (overflow.length) throw new Error(`layout overflows:\n  ${overflow.join('\n  ')}`)
    const out = isAbsolute(opt.out) ? opt.out : join(repoDir, opt.out)
    mkdirSync(dirname(out), { recursive: true })
    const big = join(tmpdir(), `thumb-film-${Date.now()}.png`)
    await page.screenshot({ path: big })
    await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', big, '-vf', 'scale=1280:720:flags=lanczos', out])
    rmSync(big, { force: true })
    console.log(`\n✅ ${out}  (${opt.theme})`)
  } finally {
    await browser.close()
  }
}

main().catch((e) => { console.error('\n✗', e.message); process.exit(1) })
