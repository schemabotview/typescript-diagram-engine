// The content registry, checked without a browser: ids, scenes named, narration length and rules.
// Lessons run 82–120 s and openers about 70 s (COURSE-PLAN.md, Decision 9), at ~2.4 words a second.
import { loadRegistry } from '../node_modules/@graphlearning/shell/scripts/_paths.mjs'

const { COURSES } = await loadRegistry()
const WPS = 2.4
const RANGE = { lesson: [82, 125], recap: [55, 85] }
let fails = 0
const fail = (where, msg) => { fails++; console.log('FAIL', where.padEnd(18), msg) }
const slugs = new Set()
for (const course of Object.values(COURSES)) {
  if (course.id !== 'intro' && course.sections[0]?.id !== 'recap') fail(course.id, 'a course from 2 on opens with its `recap` section (Decision 9)')
  course.sections.forEach((s, i) => {
    const slug = `${course.id}-${s.id}`
    if (slugs.has(slug)) fail(slug, 'duplicate section slug')
    slugs.add(slug)
    if (s.id === 'recap' && i !== 0) fail(slug, 'the recap is section 0, once per course')
    if (!s.scene) fail(slug, 'no scene')
    const words = s.narration.trim().split(/\s+/).length, secs = words / WPS
    const [lo, hi] = RANGE[s.id === 'recap' ? 'recap' : 'lesson']
    if (secs < lo || secs > hi) fail(slug, `narration ~${secs.toFixed(0)} s (${words} words), wants ${lo}–${hi} s`)
    // Never reads code aloud: no backticks, braces or file-shaped tokens with dots in the prose.
    if (/[`{}<>;=]|\b\w+\.(ts|js|json|svg)\b/.test(s.narration)) fail(slug, 'narration reads code or a file name as code (say "main dot ts")')
    if (/\b(master|mastered|you now know)\b/i.test(s.narration)) fail(slug, 'narration claims mastery')
    if (!/[.?!]$/.test(s.narration.trim())) fail(slug, 'narration ends mid-sentence')
    console.log('ok  ', slug.padEnd(18), `~${secs.toFixed(0)} s`)
  })
}
console.log(fails ? `FAILED: ${fails}` : 'content OK')
process.exit(fails ? 1 : 0)
