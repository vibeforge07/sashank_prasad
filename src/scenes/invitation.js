import { gsap } from 'gsap'

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
    tl.addLabel(`rest-${i}`, t + turn)
  })

  // as on the red-rose card: the white alpona behind the card blooms in as the card faces you,
  // turns with the pages, the two sides against each other, and goes with the last page
  const end = tl.duration()
  tl.to('.inv-hint', { autoAlpha: 0, duration: 0.4 }, end - 0.6)
  tl.fromTo('.iv-alpona', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 2.4)
    .fromTo('.iv-alpona-l .iv-alpona-turn', { rotation: -40 }, { rotation: 80, duration: end, ease: 'none' }, 0)
    .fromTo('.iv-alpona-r .iv-alpona-turn', { rotation: 40 }, { rotation: -80, duration: end, ease: 'none' }, 0)
    .to('.iv-alpona', { autoAlpha: 0, scale: 0.85, duration: 1.1, ease: 'power2.in' }, end - 1.1)
}

// while the card is on screen, as on the red-rose card: each alpona keeps turning slowly on its own,
// one full turn in two minutes, the two sides opposite ways, and the chandelier sways on its chain
export function idleInvitation(q) {
  const room = q('iv-decor')
  if (!room) return []
  const $ = (s) => [...room.querySelectorAll(s)]
  return [
    ...$('.iv-alpona-art').map((a, i) => gsap.to(a, { rotation: i ? -360 : 360, duration: 120, ease: 'none', repeat: -1 })),
    gsap.fromTo(room.querySelector('.iv-chand'), { rotation: -0.8 }, { rotation: 0.8, duration: 3.5, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  ]
}
