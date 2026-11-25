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

// grow out of the ground, the way the temples come up behind the trees
export function rise(tl, q, ids, at, dur = 1.1) {
  const els = list(q, ids)
  if (!els.length) return
  tl.fromTo(els, { yPercent: 70, scale: 0.35, autoAlpha: 0, transformOrigin: '50% 100%' },
    { yPercent: 0, scale: 1, duration: dur, ease: 'power3.out', stagger: 0.35 }, at)
  tl.to(els, { autoAlpha: 1, duration: 0.15, stagger: 0.35 }, at)
}

export function fade(tl, q, ids, at, dur = 0.6) {
  const els = list(q, ids)
  if (els.length) tl.fromTo(els, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'none', stagger: 0.1 }, at)
}

// camera. `on` is the point of the stage that stays put, as percentages
export function camera(tl, world, { scale = 1, on = '50% 80%', at = 0, dur = 0, ease = 'power2.inOut', y = 0 }) {
  if (dur) tl.to(world, { scale, yPercent: y, duration: dur, ease }, at)
  else tl.set(world, { scale, yPercent: y, transformOrigin: on }, at)
}

// the hard cut to a close-up, a slow push while it holds, and the cut back
export function closeUp(tl, world, { at, until, scale = 2.1, on = '50% 78%', y = 0 }) {
  tl.set(world, { transformOrigin: on, scale, yPercent: y }, at)
  tl.to(world, { scale: scale * 1.035, duration: until - at, ease: 'none' }, at + 0.01)
  tl.set(world, { scale: 1, yPercent: 0 }, until)
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
  drift: (q, id, x, dur) => gsap.fromTo(inner(q, id), { x: -x }, { x, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  bob: (q, id, y = 5, dur = 2.4, rot = 1) => gsap.fromTo(inner(q, id), { y: -y, rotation: -rot }, { y, rotation: rot, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  sway: (q, id, deg = 1.5, dur = 2.6, origin = '50% 0%') => gsap.fromTo(inner(q, id), { rotation: -deg }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
  breathe: (q, id, dur = 1.8, amount = 0.008) => gsap.fromTo(inner(q, id), { scaleY: 1 }, { scaleY: 1 + amount, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  lean: (q, id, deg = 1.2, dur = 1.6) => gsap.fromTo(inner(q, id), { rotation: -deg * 0.4 }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  hinge: (q, id, from, to, dur, origin) => gsap.fromTo(inner(q, id), { rotation: from }, { rotation: to, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
}
