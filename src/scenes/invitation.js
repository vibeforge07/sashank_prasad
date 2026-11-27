import { gsap } from 'gsap'
import { petals } from '../components/petals.js'

// The invitation card, the same scene as the red-rose card site. The guest's swipe drives this timeline
// (components/drive.js), resting at every `rest` label:
// the seal comes off, the flap opens, the card slides out lying on its side, the envelope drops away,
// the card stands up, comes to the middle and grows to face you, and every page turns with the scroll.
// One page = 300 x 420 envelope units; the envelope is 640 x 430 and is fitted to the screen with --fit.

const PW = 300
const PH = 420
const clamp = (a, b, v) => Math.min(b, Math.max(a, v))

export function playInvitation(tl, root) {
  const $ = (s) => root.querySelector(s)
  const $$ = (s) => [...root.querySelectorAll(s)]
  const stage = $('.stage')
  const W = stage.clientWidth
  const H = stage.clientHeight
  const book = $('.book')
  const wide = book.classList.contains('book-wide')
  const leaves = $$('.leaf:not(.leaf-base)')
  const env = $('.env-stage')

  const fit = clamp(0.42, 1.15, Math.min((W - 32) / 640, (H * 0.5) / 430))
  env.style.setProperty('--fit', fit.toFixed(3))
  // the card's size once it is out and facing you, and how far the envelope's centre sits below the middle
  const S = wide
    ? clamp(0.5, 3, Math.min((0.8 * H) / (PH * fit), (0.86 * W) / (2 * PW * fit)))
    : clamp(0.5, 4, Math.min((0.74 * H) / (PH * fit), (0.88 * W) / (PW * fit)))
  const off = env.offsetTop + env.offsetHeight / 2 - H / 2

  tl.set(book, { rotation: -90, x: 0, y: 0, scale: 1, autoAlpha: 1, rotationX: 0, willChange: 'auto' }, 0)
  tl.set(leaves, { rotationY: 0, z: 0, autoAlpha: 1, '--sh': 0, willChange: 'auto' }, 0)
  leaves.forEach((l, i) => tl.set(l, { zIndex: leaves.length - i + 1 }, 0))
  tl.set('.env-flap', { zIndex: 4 }, 0)

  tl.to({}, { duration: 0.3 })
  // the room wakes as the seal breaks: the light swells and settles behind the card, the glints brighten,
  // the drapes draw apart and the elephants step back to give the card its room
  tl.fromTo('.iv-glow', { autoAlpha: 0.6, scale: 0.85 }, { autoAlpha: 1, scale: 1.25, duration: 0.7, ease: 'power2.out' }, 0.3)
    .to('.iv-glow', { autoAlpha: 0.8, scale: 1.05, duration: 1.8, ease: 'sine.inOut' }, 1.0)
    .fromTo('.iv-sparks', { autoAlpha: 0.6 }, { autoAlpha: 1, duration: 0.8 }, 0.3)
    .fromTo('.iv-drape-l', { xPercent: 0 }, { xPercent: -30, duration: 2.4, ease: 'power2.inOut' }, 0.5)
    .fromTo('.iv-drape-r', { xPercent: 0 }, { xPercent: 30, duration: 2.4, ease: 'power2.inOut' }, 0.5)
    .fromTo('.iv-ele-l', { xPercent: 0 }, { xPercent: -10, duration: 1.6, ease: 'power2.inOut' }, 2.7)
    .fromTo('.iv-ele-r', { xPercent: 0 }, { xPercent: 10, duration: 1.6, ease: 'power2.inOut' }, 2.7)
  tl.to('.env-seal', { scale: 0.4, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, 0.3)
    .to('.env-flap', { rotationX: 180, duration: 1.1, ease: 'power2.inOut' }, 0.55)
    .set('.env-flap', { zIndex: 1 }, 1.1)
    // while the card moves and grows, the phone slides one finished picture of it around instead of
    // drawing it again every frame; once it stands still it is drawn again, sharp, at its full size,
    // and from then on each page is its own picture for the turns
    .set(book, { willChange: 'transform' }, 1.5)
    .set(book, { willChange: 'auto' }, 4.45)
    .set(leaves, { willChange: 'transform' }, 4.45)
    // the card slides out lying on its side...
    .to(book, { y: -235, duration: 1.4, ease: 'power2.out' }, 1.55)
    .to('.inv-head', { autoAlpha: 0, y: -40, duration: 0.6 }, 0.45)
    .to(['.env-back', '.env-front', '.env-flap'], { y: 560, autoAlpha: 0, duration: 1.2, ease: 'power2.in' }, 2.75)
    // ...then stands up, comes to the middle and grows to face you
    .to(book, { rotation: 0, y: -off / fit, scale: S, duration: 1.5, ease: 'power2.inOut' }, 2.9)
    .fromTo('.inv-ring', { autoAlpha: 0.14, scale: 0.8 }, { autoAlpha: 0.32, scale: 1, duration: 1.6, ease: 'power2.out' }, 2.8)
    .addLabel('rest-out', 4.5)

  leaves.forEach((leaf, i) => {
    const t = Math.max(4.5, tl.duration())
    const turn = 1.3
    tl.set(leaf, { zIndex: 100 }, t)
      .to(leaf, { rotationY: -180, duration: turn, ease: 'power1.inOut' }, t)
      // the page lifts off the stack while it turns, and the light falls across it
      .to(leaf, { z: 40, '--sh': 1, duration: turn / 2, ease: 'power1.out' }, t)
      .to(leaf, { z: 0, '--sh': 0, duration: turn / 2, ease: 'power1.in' }, t + turn / 2)
      .set(leaf, { zIndex: 10 + i }, t + turn)
    // desktop: the opening cover slides the book over, so the open spread sits in the middle
    if (wide && i === 0) tl.to(book, { x: (PW / 2) * S, duration: turn, ease: 'power1.inOut' }, t)
    // phone: a turned page leaves the screen
    if (!wide) tl.to(leaf, { autoAlpha: 0, duration: turn * 0.3 }, t + turn * 0.7)
    // a few petals fall from the spine as each page goes over (only going forward)
    tl.call(() => {
      if (tl.reversed() || root.dataset.back === '1') return
      const r = book.getBoundingClientRect()
      const x = wide ? r.left + r.width / 2 : r.left
      const box = document.createElement('div')
      box.className = 'g-petals sc-petals'
      document.body.appendChild(box)
      petals(box, 9, { x, y: r.top + r.height * 0.25 })
      setTimeout(() => box.remove(), 5500)
    }, null, t + turn * 0.5)
    tl.addLabel(`rest-${i}`, t + turn)
  })

  // the mandala behind the card turns slowly with the pages
  tl.fromTo('.inv-ring', { rotation: -30 }, { rotation: 60, duration: tl.duration(), ease: 'none' }, 0)
  tl.to('.inv-hint', { autoAlpha: 0, duration: 0.4 }, tl.duration() - 0.6)
}

// petals keep falling for as long as the card is on screen, and the room breathes: the light swells and
// eases, the glints twinkle, the drapes and strands sway, the elephants breathe
export function idleInvitation(q) {
  const box = q('inv-petals')
  const room = q('iv-decor')
  if (!box || !room) return []
  const $ = (s) => [...room.querySelectorAll(s)]
  const loop = { yoyo: true, repeat: -1, ease: 'sine.inOut' }
  const air = [
    gsap.fromTo(room.querySelector('.iv-glow i'), { scale: 0.95, opacity: 1 }, { scale: 1.07, opacity: 0.75, duration: 3.4, ...loop }),
    ...$('.iv-spark').map((s, i) => gsap.fromTo(s, { scale: 0.3, opacity: 0.15, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 45, duration: 1.3 + (i % 4) * 0.35, delay: (i * 0.37) % 2.2, ...loop })),
    ...$('.iv-drape').map((d, i) => gsap.fromTo(d, { rotation: i ? 1.3 : -1.3 }, { rotation: i ? -1.1 : 1.1, duration: 3.8 + i * 0.6, ...loop })),
    ...$('.iv-mala img').map((m, i) => gsap.fromTo(m, { rotation: -1.6 }, { rotation: 1.6, duration: 2.3 + (i % 3) * 0.4, delay: (i * 0.29) % 1.2, ...loop })),
    ...$('.iv-ele').map((e, i) => gsap.fromTo(e, { scaleY: 1 }, { scaleY: 1.018, duration: 2.2 + i * 0.35, ...loop })),
  ]
  return [...air, ...[...box.children].flatMap((p, i) => {
    const x = ((i * 37) % 100) / 100
    return [
      gsap.fromTo(p, { left: `${x * 100}%`, y: '-8vh', x: 0, rotation: i * 40 },
        { y: '108vh', x: (i % 2 ? 1 : -1) * (30 + (i % 5) * 12), rotation: `+=${(i % 2 ? 1 : -1) * 300}`, duration: 8 + (i % 5) * 1.3, delay: i * 0.7, repeat: -1, ease: 'none' }),
      gsap.fromTo(p, { rotationX: 0 }, { rotationX: 70, duration: 0.7 + (i % 3) * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
    ]
  })]
}
