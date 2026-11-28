import { gsap } from 'gsap'

// Small vocabulary shared by every scene. `q` finds a layer inside the scene,
// times are seconds from the start of that scene.

export const makeQ = (root) => (id) => root.querySelector(`[data-l="${id}"]`)

const list = (q, ids) => [].concat(ids).map(q).filter(Boolean)

// slide in from off screen: from = 'left' | 'right' | 'up' | 'down'
export function slide(tl, q, ids, from, at, dur = 0.9, ease = 'power3.out') {
  const els = list(q, ids)
  if (!els.length) return
  const v = { left: { x: '-115vw' }, right: { x: '115vw' }, up: { yPercent: -115 }, down: { yPercent: 115 } }[from]
  tl.fromTo(els, v, { x: 0, yPercent: 0, duration: dur, ease, stagger: 0.12 }, at)
}

// come up from behind the hills; nothing on the page ever changes size
export function rise(tl, q, ids, at, dur = 1.3) {
  const els = list(q, ids)
  if (els.length) tl.fromTo(els, { yPercent: 100 }, { yPercent: 0, duration: dur, ease: 'power3.out', stagger: 0.3 }, at)
}

// text lines, one after the other, in the order they sit in the markup
export function lines(tl, root, at, { dur = 0.75, step = 0.55 } = {}) {
  const els = [...root.querySelectorAll('[data-t]')]
  els.forEach((el) => {
    const t = at + Number(el.dataset.t) * step
    tl.fromTo(el, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: dur, ease: 'power1.out' }, t)
  })
}

// ---- idle motion: runs for as long as the scene is on screen ----
const inner = (q, id) => q(id)?.firstElementChild

export const idle = {
  // drives across the whole screen (rightward by default, or pass from/to for leftward), again and again
  drive: (q, id, dur, rest, from = '-85vw', to = '85vw') => inner(q, id) && gsap.fromTo(inner(q, id), { x: from }, { x: to, duration: dur, ease: 'none', repeat: -1, repeatDelay: rest }),
  spin: (q, id, dur, rest, deg = 2880) => {
    const img = q(id)?.querySelector('img')
    return img && gsap.fromTo(img, { rotation: 0 }, { rotation: deg, duration: dur, ease: 'none', repeat: -1, repeatDelay: rest })
  },
  glow: (q, id, dur = 3.6) => inner(q, id) && gsap.fromTo(inner(q, id), { opacity: 0.88, filter: 'brightness(0.96)' }, { opacity: 1, filter: 'brightness(1.12)', duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  drift: (q, id, x, dur) => gsap.fromTo(inner(q, id), { x: -x }, { x, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  bob: (q, id, y = 5, dur = 2.4, rot = 1) => gsap.fromTo(inner(q, id), { y: -y, rotation: -rot }, { y, rotation: rot, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  sway: (q, id, deg = 1.5, dur = 2.6, origin = '50% 0%') => gsap.fromTo(inner(q, id), { rotation: -deg }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
  breathe: (q, id, dur = 1.8, amount = 0.008) => gsap.fromTo(inner(q, id), { scaleY: 1 }, { scaleY: 1 + amount, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  lean: (q, id, deg = 1.2, dur = 1.6) => gsap.fromTo(inner(q, id), { rotation: -deg * 0.4 }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  // the groom's hand at Haldi: rubs her cheek twice, lifts back into his sleeve, waits, comes back.
  // The forearm pivots at his cuff (757, 362 in the 1400 x 948 picture); moves are in % of the picture.
  haldi: (q, id) => {
    const img = q(id)?.querySelector('img')
    if (!img) return null
    const t = gsap.timeline({ repeat: -1, repeatDelay: 0.4, defaults: { transformOrigin: '54.07% 38.19%' } })
    t.to(img, { rotation: -1.6, duration: 0.32, ease: 'sine.inOut' })
      .to(img, { rotation: 0.6, duration: 0.32, ease: 'sine.inOut' })
      .to(img, { rotation: -1.6, duration: 0.32, ease: 'sine.inOut' })
      .to(img, { rotation: 0, duration: 0.3, ease: 'sine.inOut' })
      .to(img, { rotation: 4, xPercent: -2.1, yPercent: 2.8, duration: 0.75, ease: 'power2.inOut' }, '+=0.3')
      .to(img, { rotation: 0, xPercent: 0, yPercent: 0, duration: 0.75, ease: 'power2.inOut' }, '+=0.9')
    return t
  },
  hinge: (q, id, from, to, dur, origin) => gsap.fromTo(inner(q, id), { rotation: from }, { rotation: to, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
  flicker: (q, id) => {
    const el = inner(q, id)
    if (!el) return null
    return gsap.timeline({ repeat: -1 })
      .to(el, { opacity: 0.88, filter: 'brightness(0.95)', duration: 0.3, ease: 'sine.inOut' })
      .to(el, { opacity: 1, filter: 'brightness(1.15)', duration: 0.24, ease: 'sine.inOut' })
      .to(el, { opacity: 0.93, filter: 'brightness(1.02)', duration: 0.36, ease: 'sine.inOut' })
      .to(el, { opacity: 1, filter: 'brightness(1.09)', duration: 0.26, ease: 'sine.inOut' })
  },
  // couple walks right in front of the fire (frontId), then turns and walks left behind it (backId)
  pheras: (q, frontId, backId, span = 22, halfDur = 5.5) => {
    const f = inner(q, frontId)
    const b = inner(q, backId)
    if (!f || !b) return null
    const fade = 0.6
    const t = gsap.timeline({ repeat: -1 })
    t.set(f, { xPercent: -span, autoAlpha: 1 }, 0)
      .set(b, { xPercent: span, autoAlpha: 0 }, 0)
      .to(f, { xPercent: span, duration: halfDur, ease: 'sine.inOut' }, 0)
      .to(f, { autoAlpha: 0, duration: fade, ease: 'sine.inOut' }, halfDur - fade)
      .to(b, { autoAlpha: 1, duration: fade, ease: 'sine.inOut' }, halfDur - fade)
      .set(f, { xPercent: -span }, halfDur + 0.05)
      .to(b, { xPercent: -span, duration: halfDur, ease: 'sine.inOut' }, halfDur)
      .to(b, { autoAlpha: 0, duration: fade, ease: 'sine.inOut' }, halfDur * 2 - fade)
      .to(f, { autoAlpha: 1, duration: fade, ease: 'sine.inOut' }, halfDur * 2 - fade)
    return t
  },
}
