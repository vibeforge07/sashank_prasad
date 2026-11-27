import { gsap } from 'gsap'

// The invitation scene, like a card arriving by hand: the envelope comes up, the sindoor seal
// breaks into petals, the flap opens, the envelope drops away and leaves the card, the cover
// opens like a book on the couple, and one page turns to the two families.
// Only the paper moves; the camera never zooms.
//
// The book is two pages wide. xPercent -25 puts its right page in the middle of the screen,
// +25 its left page, 0 the whole spread. A phone shows one page at a time, so there the book
// slides from page to page; a wide screen shows the spread.

export function playInvitation(tl, root) {
  const $ = (s) => root.querySelector(s)
  const $$ = (s) => [...root.querySelectorAll(s)]
  const wide = root.clientWidth >= root.clientHeight
  const env = $$('.env')
  const book = $('.book')
  const cover = $('.leaf-cover')
  const leaf = $('.leaf-a')
  const flap = $('.env-fl')
  const seal = $('.seal')
  const burst = $$('.burst img')

  tl.set(book, { xPercent: -25, yPercent: 5 }, 0)
  tl.set(flap, { zIndex: 4 }, 0)
  tl.set(leaf, { zIndex: 2 }, 0)

  // the envelope arrives with the card inside
  tl.fromTo($('.inv-stage'), { yPercent: 160 }, { yPercent: 0, duration: 1.1, ease: 'power3.out' }, 0.1)
  tl.fromTo($$('.iv-pais, .iv-mala'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 0)

  // the seal is pressed and breaks into petals
  tl.fromTo(seal, { scale: 1 }, { scale: 0.88, duration: 0.14, yoyo: true, repeat: 1, ease: 'power1.inOut' }, 1.35)
  tl.fromTo(seal, { autoAlpha: 1 }, { autoAlpha: 0, scale: 1.25, duration: 0.35, ease: 'power1.in' }, 1.65)
  tl.fromTo(burst, { x: 0, y: 0, autoAlpha: 1, scale: 0.4, rotation: 0 }, {
    x: (i) => Math.cos((i / burst.length) * 6.283 + 0.4) * (60 + (i % 3) * 26),
    y: (i) => Math.sin((i / burst.length) * 6.283 + 0.4) * (46 + (i % 4) * 18) + 70,
    rotation: (i) => (i % 2 ? 1 : -1) * (120 + i * 20),
    scale: 1, autoAlpha: 0, duration: 1.3, ease: 'power2.out', stagger: 0.02,
  }, 1.65)

  // the flap opens and folds behind the card
  tl.fromTo($('.flap'), { rotationX: 0 }, { rotationX: 180, duration: 0.9, ease: 'power2.inOut' }, 1.95)
  tl.set(flap, { zIndex: 0 }, 2.4)

  // the envelope drops away and the card is pulled out of it
  tl.fromTo(env, { yPercent: 0, autoAlpha: 1 }, { yPercent: 150, duration: 1.3, ease: 'power2.in' }, 2.95)
  tl.set(env, { autoAlpha: 0 }, 4.25) // the open flap would still peep up from below
  tl.to(book, { yPercent: -4, duration: 0.9, ease: 'power2.out' }, 2.95)
  tl.to(book, { yPercent: 0, duration: 0.6, ease: 'power1.inOut' }, 3.85)

  // the cover opens on the couple
  const open = 4.5
  tl.fromTo(cover, { rotationY: 0 }, { rotationY: -180, duration: 1.6, ease: 'power2.inOut' }, open)
  if (wide) {
    tl.to(book, { xPercent: 0, duration: 1.6, ease: 'power2.inOut' }, open)
    // time to read the spread, then the page turns to the families
    const turn = open + 1.6 + 4.2
    tl.set(leaf, { zIndex: 5 }, turn)
    tl.fromTo(leaf, { rotationY: 0 }, { rotationY: -180, duration: 1.6, ease: 'power2.inOut' }, turn)
    return
  }
  tl.to(book, { xPercent: 25, duration: 1.6, ease: 'power2.inOut' }, open)
  let t = open + 1.6 + 2.2
  tl.to(book, { xPercent: -25, duration: 1, ease: 'power2.inOut' }, t)
  t += 1 + 3.8
  tl.set(leaf, { zIndex: 5 }, t)
  tl.fromTo(leaf, { rotationY: 0 }, { rotationY: -180, duration: 1.6, ease: 'power2.inOut' }, t)
  tl.to(book, { xPercent: 25, duration: 1.6, ease: 'power2.inOut' }, t)
  t += 1.6 + 4.2
  tl.to(book, { xPercent: -25, duration: 1, ease: 'power2.inOut' }, t)
}

// petals keep falling for as long as the card is on screen
export function idleInvitation(q) {
  const box = q('inv-petals')
  if (!box) return []
  return [...box.children].flatMap((p, i) => {
    const x = ((i * 37) % 100) / 100
    return [
      gsap.fromTo(p, { left: `${x * 100}%`, y: '-8vh', x: 0, rotation: i * 40 },
        { y: '108vh', x: (i % 2 ? 1 : -1) * (30 + (i % 5) * 12), rotation: `+=${(i % 2 ? 1 : -1) * 300}`, duration: 7 + (i % 5) * 1.3, delay: i * 0.55, repeat: -1, ease: 'none' }),
      gsap.fromTo(p, { rotationX: 0 }, { rotationX: 70, duration: 0.7 + (i % 3) * 0.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }),
    ]
  })
}
