// Petals, only where someone taps. Ported from the red-rose card's tap petals (Biyer-card-online 1, src/motion/petals.js):
// a soft toss up out of the finger, then each petal drifts down at its own slow speed, swaying side to side and
// turning over as it falls, and fades before it lands; a thin gold ring and a few gold motes open where the tap was.
// One canvas over the whole page draws them all; it only runs while something is in the air.
export const PETALS = Object.values(import.meta.glob('../opening/petal-*.webp', { eager: true, query: '?url', import: 'default' }))

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches
const rnd = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))
const MAX = 90 // petals in the air at once, so many fast taps stay light

let field = null
function getField() {
  if (field) return field
  const c = document.createElement('canvas')
  c.className = 'tap-petals'
  c.setAttribute('aria-hidden', 'true')
  document.body.appendChild(c)
  const x = c.getContext('2d')
  const imgs = PETALS.map((src) => { const i = new Image(); i.src = src; return i })
  const f = { c, x, imgs, p: [], raf: 0, t: 0, w: 0, h: 0, dpr: 1 }
  const size = () => {
    f.dpr = Math.min(devicePixelRatio || 1, 2)
    f.w = innerWidth
    f.h = innerHeight
    c.width = Math.round(f.w * f.dpr)
    c.height = Math.round(f.h * f.dpr)
  }
  size()
  addEventListener('resize', size)
  field = f
  return f
}

function make(x, y, vx, vy) {
  return {
    x, y, vx, vy,
    size: rnd(16, 30),
    img: (Math.random() * PETALS.length) | 0,
    rot: rnd(0, Math.PI * 2),
    vr: rnd(-1.1, 1.1), // slow turning
    ph: rnd(0, 6),
    vf: rnd(1.2, 3), // how fast it flips over
    sway: rnd(16, 38),
    sf: rnd(0.6, 1.5),
    term: rnd(34, 70), // the slow speed it settles to, px a second
    age: 0,
    life: rnd(5.5, 8.5),
  }
}

// n petals out of the point (x, y), in screen pixels; gold: the ring and motes as well
export function shower(x, y, n = 14, gold = true) {
  if (reduced || !PETALS.length) return
  const f = getField()
  const room = Math.max(0, MAX - f.p.filter((p) => !p.spark && !p.ring).length)
  for (let i = 0; i < Math.min(n, room); i++) {
    // a gentle toss, mostly upwards, before the long slow fall
    const a = -Math.PI / 2 + rnd(-0.8, 0.8) * Math.PI * 0.85
    const sp = rnd(120, 360)
    f.p.push(make(x, y, Math.cos(a) * sp, Math.sin(a) * sp))
  }
  if (gold) {
    f.p.push({ ring: true, x, y, age: 0, life: 1.1 })
    for (let i = 0; i < 22; i++) {
      const a = rnd(0, Math.PI * 2)
      const sp = rnd(40, 220)
      f.p.push({ spark: true, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 80, age: 0, life: rnd(1.2, 2.4), size: rnd(1.4, 3) })
    }
  }
  run(f)
}

function run(f) {
  if (f.raf) return
  let last = performance.now()
  const loop = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    step(f, dt)
    f.raf = f.p.length ? requestAnimationFrame(loop) : 0
    if (!f.raf) f.x.clearRect(0, 0, f.c.width, f.c.height)
  }
  f.raf = requestAnimationFrame(loop)
}

function step(f, dt) {
  f.t += dt
  const { x, w, h, dpr } = f
  x.setTransform(1, 0, 0, 1, 0, 0)
  x.clearRect(0, 0, f.c.width, f.c.height)
  const keep = []
  for (const p of f.p) {
    p.age += dt
    if (p.ring) {
      const k = p.age / p.life
      if (k >= 1) continue
      const e = 1 - Math.pow(1 - k, 3)
      x.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr)
      x.strokeStyle = '#f6dd94'
      x.globalAlpha = (1 - k) * 0.8
      x.lineWidth = 2 * (1 - k) + 0.4
      x.beginPath(); x.arc(0, 0, 8 + 70 * e, 0, Math.PI * 2); x.stroke()
      x.globalAlpha = (1 - k) * 0.3
      x.beginPath(); x.arc(0, 0, 4 + 42 * e, 0, Math.PI * 2); x.stroke()
      keep.push(p)
      continue
    }
    if (p.spark) {
      p.vy += 160 * dt
      p.vx *= Math.pow(0.2, dt)
      p.x += p.vx * dt
      p.y += p.vy * dt
      const a = clamp(1 - p.age / p.life, 0, 1) * (0.6 + 0.4 * Math.sin(p.age * 24))
      if (a <= 0) continue
      x.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr)
      x.globalAlpha = a
      x.fillStyle = '#f6dd94'
      const s = p.size
      x.beginPath()
      x.moveTo(0, -s * 2); x.quadraticCurveTo(0, 0, s * 2, 0); x.quadraticCurveTo(0, 0, 0, s * 2)
      x.quadraticCurveTo(0, 0, -s * 2, 0); x.quadraticCurveTo(0, 0, 0, -s * 2)
      x.fill()
      keep.push(p)
      continue
    }
    // the toss slows in the air, then the petal settles into its own slow fall
    p.vy = Math.min(p.vy + 420 * dt, p.term)
    p.vx *= Math.pow(0.22, dt)
    p.x += (p.vx + Math.sin(f.t * p.sf + p.ph) * p.sway) * dt
    p.y += p.vy * dt
    p.rot += p.vr * dt
    if (p.y > h + 40 || p.age > p.life || p.x < -80 || p.x > w + 80) continue
    const fade = clamp((p.life - p.age) / 1.4, 0, 1) * clamp(p.age / 0.15, 0, 1)
    const flip = Math.cos(f.t * p.vf + p.ph)
    x.setTransform(dpr, 0, 0, dpr, p.x * dpr, p.y * dpr)
    x.rotate(p.rot)
    x.scale(0.25 + 0.75 * Math.abs(flip), 1)
    x.globalAlpha = 0.95 * fade
    const img = f.imgs[p.img]
    if (img.complete && img.naturalWidth) {
      const s = p.size
      const hgt = (s * img.naturalHeight) / img.naturalWidth
      x.drawImage(img, -s / 2, -hgt / 2, s, hgt)
    }
    keep.push(p)
  }
  x.globalAlpha = 1
  f.p = keep
}
