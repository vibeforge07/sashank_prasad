import { gsap } from 'gsap'

// The last page (components/Words.jsx Closing): the two flanking arches rise from below while the
// center arch descends from above, the brass lamp settles onto its ledge, then the hint asks for a tap.
// Lighting the lamp is the guest's (Closing's own timeline).
export function playClosing(tl, root) {
  const $ = (s) => root.querySelector(s)
  const $$ = (s) => [...root.querySelectorAll(s)]
  tl.fromTo($$('.cl-wing'), { yPercent: 115 }, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0)
    .fromTo($('.cl-arch'), { yPercent: -115 }, { yPercent: 0, duration: 1.4, ease: 'power3.out' }, 0)
    .fromTo($('.cl-lamp'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.9)
    .fromTo($('.cl-hint'), { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.7, ease: 'power1.out' }, 1.4)
}

// while the page is on screen: the hint breathes until the lamp is lit, the lamps on the pillars flicker,
// the light around the flame swells and eases
export function idleClosing(q) {
  const box = q('cl-arch')
  if (!box) return []
  const loop = { yoyo: true, repeat: -1, ease: 'sine.inOut' }
  return [
    gsap.fromTo(box.querySelector('.cl-hint i:first-child'), { scale: 0.6, rotation: 0 }, { scale: 1.1, rotation: 45, duration: 1.1, ...loop }),
    gsap.fromTo(box.querySelector('.cl-hint i:last-child'), { scale: 1.1, rotation: 45 }, { scale: 0.6, rotation: 0, duration: 1.1, ...loop }),
    gsap.fromTo(box.querySelector('.cl-lamp'), { '--halo': 0 }, { '--halo': 1, duration: 1.2, ...loop }),
    ...[...box.querySelectorAll('.cl-niche')].map((n, i) => gsap.fromTo(n, { '--f2': 1 }, { '--f2': 0.62, duration: 0.5 + (i % 5) * 0.13, delay: (i * 0.23) % 1.1, ...loop })),
    gsap.fromTo(box.querySelector('.cl-glow'), { '--g': 1 }, { '--g': 0.8, duration: 2.6, ...loop }),
    ...[...box.querySelectorAll('.iv-spark')].map((s, i) => gsap.fromTo(s, { scale: 0.3, opacity: 0.1, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 45, duration: 1.1 + (i % 4) * 0.3, delay: (i * 0.41) % 2, ...loop })),
  ]
}
