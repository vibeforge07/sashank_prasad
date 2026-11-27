import { gsap } from 'gsap'

export const PETALS = Object.values(import.meta.glob('../opening/petal-*.webp', { eager: true, query: '?url', import: 'default' }))
const rnd = gsap.utils.random

// flowers thrown out of a point, or let fall from the top edge (box: a full-screen layer)
export function petals(box, n, from) {
  const W = window.innerWidth
  const H = window.innerHeight
  for (let i = 0; i < n; i++) {
    const p = document.createElement('img')
    p.src = PETALS[i % PETALS.length]
    p.alt = ''
    const s = rnd(18, 34)
    p.style.width = `${s}px`
    box.appendChild(p)
    const x0 = from ? from.x : rnd(0, W)
    const y0 = from ? from.y : rnd(-80, -20)
    gsap.set(p, { x: x0 - s / 2, y: y0 - s / 2, rotation: rnd(0, 360), scale: from ? 0.3 : 1 })
    const tl = gsap.timeline({ onComplete: () => p.remove() })
    if (from) {
      tl.to(p, { x: x0 + rnd(-0.55, 0.55) * W, y: y0 - rnd(0.12, 0.4) * H, scale: 1, rotation: `+=${rnd(-200, 200)}`, duration: rnd(0.6, 0.9), ease: 'power2.out' })
    }
    tl.to(p, { y: H + 60, x: `+=${rnd(-60, 60)}`, rotation: `+=${rnd(-260, 260)}`, duration: rnd(2.6, 4.2), ease: 'power1.in' })
    tl.to(p, { rotationX: 70, duration: 0.6, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 0.2)
  }
}
