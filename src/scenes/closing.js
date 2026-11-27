import { gsap } from 'gsap'

// The last page (components/Words.jsx Closing): the carved arch rises out of the night, the ledge and the unlit
// lamp settle, then the hint asks for a tap. Lighting the lamp is the guest's (Closing's own timeline).
export function playClosing(tl, root) {
  const $ = (s) => root.querySelector(s)
  tl.fromTo($('.cl-arch'), { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: 'power3.out' }, 0)
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
    gsap.fromTo(box.querySelector('.cl-lamp svg'), { filter: 'drop-shadow(0 0 0 #ffd27a00)' }, { filter: 'drop-shadow(0 0 10px #ffd27aaa)', duration: 1.2, ...loop }),
    ...[...box.querySelectorAll('.cl-niche')].map((n, i) => gsap.fromTo(n, { '--f': 1 }, { '--f': 0.62, duration: 0.5 + (i % 5) * 0.13, delay: (i * 0.23) % 1.1, ...loop })),
    gsap.fromTo(box.querySelector('.cl-glow'), { '--g': 1 }, { '--g': 0.8, duration: 2.6, ...loop }),
    ...[...box.querySelectorAll('.iv-spark')].map((s, i) => gsap.fromTo(s, { scale: 0.3, opacity: 0.1, rotation: 0 },
      { scale: 1, opacity: 1, rotation: 45, duration: 1.1 + (i % 4) * 0.3, delay: (i * 0.41) % 2, ...loop })),
  ]
}
