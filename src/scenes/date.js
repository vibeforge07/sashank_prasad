import { gsap } from 'gsap'

// The wedding date's own page (components/Words.jsx DatePage): the lanterns come down on their strings,
// the lamp stands rise, the heading, the line under it and the hint come in, then the three gold tiles.
export function playDate(tl, root) {
  const $ = (s) => root.querySelector(s)
  const $$ = (s) => [...root.querySelectorAll(s)]
  tl.fromTo('.dt-glow', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 1.6, ease: 'power2.out' }, 0)
    .fromTo($$('.dt-lamp'), { yPercent: -110 }, { yPercent: 0, duration: 1.3, ease: 'power3.out', stagger: 0.12 }, 0.1)
    .fromTo($$('.dt-stand'), { yPercent: 105 }, { yPercent: 0, duration: 1.2, ease: 'power3.out', stagger: 0.12 }, 0.2)
    .fromTo($('.dt-title'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.4)
    .fromTo($('.dt-orn'), { autoAlpha: 0, scaleX: 0.2 }, { autoAlpha: 1, scaleX: 1, duration: 0.8, ease: 'power2.out' }, 0.7)
    .fromTo($('.dt-hint'), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power1.out' }, 1.0)
    .fromTo($$('.dt-col'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.14 }, 1.3)
}

// while the page is on screen: the lanterns sway on their strings, the light breathes, the glints twinkle
export function idleDate(q) {
  const room = q('dt-decor')
  if (!room) return []
  const $$ = (s) => [...room.querySelectorAll(s)]
  const loop = { yoyo: true, repeat: -1, ease: 'sine.inOut' }
  return [
    gsap.fromTo(room.querySelector('.dt-glow'), { opacity: 1 }, { opacity: 0.7, duration: 3.2, ...loop }),
    ...$$('.dt-lamp').map((l, i) => gsap.fromTo(l, { rotation: i ? 1.8 : -1.8 }, { rotation: i ? -1.8 : 1.8, duration: 3 + i * 0.5, ...loop })),
    ...$$('.iv-spark').map((s, i) => gsap.fromTo(s, { scale: 0.3, opacity: 0.15, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 45, duration: 1.3 + (i % 4) * 0.35, delay: (i * 0.37) % 2.2, ...loop })),
  ]
}
