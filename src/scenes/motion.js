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
  // drives across the whole screen to the right, again and again
  drive: (q, id, dur, rest) => inner(q, id) && gsap.fromTo(inner(q, id), { x: '-75vw' }, { x: '75vw', duration: dur, ease: 'none', repeat: -1, repeatDelay: rest }),
  drift: (q, id, x, dur) => gsap.fromTo(inner(q, id), { x: -x }, { x, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
  bob: (q, id, y = 5, dur = 2.4, rot = 1) => gsap.fromTo(inner(q, id), { y: -y, rotation: -rot }, { y, rotation: rot, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  sway: (q, id, deg = 1.5, dur = 2.6, origin = '50% 0%') => gsap.fromTo(inner(q, id), { rotation: -deg }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
  breathe: (q, id, dur = 1.8, amount = 0.008) => gsap.fromTo(inner(q, id), { scaleY: 1 }, { scaleY: 1 + amount, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  lean: (q, id, deg = 1.2, dur = 1.6) => gsap.fromTo(inner(q, id), { rotation: -deg * 0.4 }, { rotation: deg, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 100%' }),
  hinge: (q, id, from, to, dur, origin) => gsap.fromTo(inner(q, id), { rotation: from }, { rotation: to, duration: dur, yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: origin }),
}
