import { slide, rise, lines, idle } from './motion.js'
import { playInvitation, idleInvitation } from './invitation.js'

// Each scene: sky, layers, where its text sits, the intro timeline and the idle motion.
// `leave` is how autoplay goes to the next scene: a hard cut or a cross-fade, as in the film.

const L = (id, w, h, o = {}) => ({ id, w, h, ...o })
const clouds = (night) => [
  L('cloud-l', 300, 190, { art: night ? 'cloud-night' : 'cloud-gold', ax: 'l', x: -150, ay: 't', y: 380, z: 2 }),
  L('cloud-r', 360, 225, { art: night ? 'cloud-night' : 'cloud-gold', ax: 'r', x: -260, ay: 't', y: 640, z: 2, flip: true }),
]
const cloudIdle = (q) => [idle.drift(q, 'cloud-l', 26, 9), idle.drift(q, 'cloud-r', 34, 11)].filter(Boolean)
const foliage = (z = 8) => [L('foliage-l', 430, 430, { art: 'foliage-corner', ax: 'l', x: -70, ay: 't', y: -60, z, kind: 'plant' }), L('foliage-r', 430, 430, { art: 'foliage-corner', ax: 'r', x: -70, ay: 't', y: -60, z, flip: true, kind: 'plant' })]
const flowers = (art, z = 9) => [L('fg-l', 520, 290, { art, ax: 'l', x: -60, y: -30, z, kind: 'plant' }), L('fg-r', 520, 290, { art, ax: 'r', x: -60, y: -30, z, flip: true, kind: 'plant' })]
const person = (id, w, h, x, y, z) => L(id, w, h, { x, y, z, kind: 'person' })
const ground = (id, h, z = 2, w = 2200) => L(id, w, h, { z, full: true, kind: 'ground', fit: 'cover' })
const petals = (q) => [idle.sway(q, 'fg-l', 0.9, 2.8, '0% 100%'), idle.sway(q, 'fg-r', 0.9, 3.1, '100% 100%')]
const leaves = (q) => [idle.sway(q, 'foliage-l', 1.2, 3.2, '0% 0%'), idle.sway(q, 'foliage-r', 1.2, 2.9, '100% 0%')]

const CALM = 'linear-gradient(#a9cbe0 0%, #bcd6e2 45%, #d9e2dc 75%, #eadfcc 100%)'
const DAY = 'linear-gradient(#b3cfc0 0%, #cfd6b4 34%, #f3cf9b 56%, #f6b183 78%)'
const RIVER = 'linear-gradient(#77c2c9 0%, #b9d6bd 22%, #f2e1a6 48%, #f8c98f 74%)'
const NIGHT = 'linear-gradient(#0b0d24 0%, #15133a 40%, #3a1b4d 72%, #63284f 92%)'
const STAGE = 'linear-gradient(#120f33 0%, #2a1a63 45%, #43268c 78%)'
// the wedding stage: deep maroon above its red curtains
// the reception hall: night blue into the hall's warm gold
const RECEPTION = 'linear-gradient(#0e0b2a 0%, #241645 40%, #5a3238 75%, #8a5434 100%)'
const WED = 'linear-gradient(#1c0306 0%, #3d0710 42%, #6a1a14 78%, #7d2813 100%)'

// the boat floats on the river, not on the bank
const BOAT_Y = 230

export const SCENES = [
  {
    id: 'hero', sky: CALM, tone: 'day', text: { top: 85 }, leave: 'cut', hold: 4,
    layers: [
      ...clouds(),
      // one painted far bank (Howrah Bridge, the steel works, the Tata Park diamond, a road with tram rails),
      // a wide picture for laptops and a tall one for phones; the tram and the taxi drive along its road
      L('scene-w', 2200, 1103, { art: 'hero-wide', z: 2, full: true, kind: 'ground', tall: 0.88 }),
      L('scene-t', 1300, 1765, { art: 'hero-tall', z: 2, full: true, kind: 'ground' }),
      L('tram-w', 1400, 588, { art: 'kolkata-tram', z: 3, road: { base: 2200, tall: 1.7552, at: 0.236, rw: 0.095 } }),
      L('taxi-w', 1400, 629, { art: 'kolkata-taxi', z: 4, road: { base: 2200, tall: 1.7552, at: 0.2177, rw: 0.066 } }),
      L('tram-t', 1400, 588, { art: 'kolkata-tram', z: 3, road: { base: 1300, at: 0.4317, rw: 0.2 } }),
      L('taxi-t', 1400, 629, { art: 'kolkata-taxi', z: 4, road: { base: 1300, at: 0.3889, rw: 0.135 } }),
      person('hero-groom', 470, 960, -230, 110, 7), person('hero-bride', 520, 960, 210, 110, 8),
      ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'hero-groom', 'left', 1.5, 1.1)
      slide(tl, q, 'hero-bride', 'right', 1.5, 1.1)
      lines(tl, root, 3, { step: 0.55 })
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), idle.lean(q, 'hero-groom', 0.8, 1.7), idle.lean(q, 'hero-bride', -0.8, 1.9),
      idle.drive(q, 'taxi-w', 11, 1.5), idle.drive(q, 'tram-w', 30, 0), idle.drive(q, 'taxi-t', 8, 1.5), idle.drive(q, 'tram-t', 20, 0)],
  },
  {
    // the invitation card itself: envelope, seal, cover, pages (scenes/invitation.js),
    // on the crimson of the opening seal, under the same toran and marigold strands
    id: 'family', own: true, scroll: true, sky: 'radial-gradient(110% 80% at 50% 45%, #a8183c 0%, #911033 55%, #6f0a26 100%)', tone: 'day', text: { top: 0 }, leave: 'cut', hold: 2,
    layers: [],
    play: (tl, q, root) => playInvitation(tl, root),
    idle: (q) => idleInvitation(q),
  },
  {
    id: 'briddhi', sky: RIVER, tone: 'day', text: { top: 220 }, leave: 'cut', hold: 4,
    layers: [
      L('sunrise', 1500, 620, { y: 600, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), ground('briddhi-courtyard', 1000, 3),
      person('briddhi-family', 1000, 563, 0, 120, 5),
      ...foliage(), ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.2, 1)
      slide(tl, q, ['foliage-l', 'foliage-r'], 'up', 0.3, 1.2)
      slide(tl, q, 'briddhi-family', 'down', 0.9, 1.1)
      lines(tl, root, 2.5)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), idle.breathe(q, 'briddhi-family')],
  },
  {
    id: 'tilak', sky: DAY, tone: 'day', text: { top: 130 }, leave: 'fade', hold: 4,
    layers: [
      L('sunrise', 1500, 620, { y: 420, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), ground('tilak-ground', 860, 2),
      L('tilak-madwa', 1460, 810, { y: 190, z: 4, kind: 'building' }),
      person('tilak-groom', 560, 724, 200, 110, 5), person('tilak-elder', 450, 640, -190, 110, 6),
      ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'tilak-madwa', 'down', 0.2, 1.2)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.5, 1)
      slide(tl, q, 'tilak-groom', 'right', 1.3, 0.95)
      slide(tl, q, 'tilak-elder', 'left', 1.5, 0.95)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), idle.lean(q, 'tilak-elder', 1, 1.6), idle.breathe(q, 'tilak-groom')],
  },
  {
    id: 'mehendi', sky: NIGHT, tone: 'night', stars: true, moon: { x: 70, y: 690, s: 110 }, text: { top: 430 }, leave: 'cut', hold: 4,
    layers: [
      L('clouds-horizon-night', 1200, 330, { y: 380, z: 1 }),
      L('cloud-l', 240, 150, { art: 'cloud-night', ax: 'l', x: 60, y: 780, z: 2 }), L('cloud-r', 240, 150, { art: 'cloud-night', ax: 'r', x: 60, y: 900, z: 2, flip: true }),
      L('mehendi-wall', 2200, 2000, { z: 2, full: true, kind: 'wall' }),
      L('mehendi-window', 1180, 2000, { y: 0, z: 3, kind: 'frame' }),
      L('mehendi-seat', 1500, 450, { y: 0, z: 4 }),
      person('mehendi-couple', 980, 650, -10, 40, 5),
      ...foliage(7), ...flowers('flowers-white').map((f) => ({ ...f, y: -90 })),
    ],
    play(tl, q, root) {
      slide(tl, q, ['foliage-l', 'foliage-r'], 'up', 0.3, 1.3)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.4, 1)
      slide(tl, q, 'mehendi-couple', 'right', 1.1, 1.2)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), idle.breathe(q, 'mehendi-couple')],
  },
  {
    id: 'aiburobhaat', sky: RIVER, tone: 'day', text: { top: 250 }, leave: 'cut', hold: 4,
    layers: [
      L('sunrise', 1500, 620, { y: 470, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), ground('aibur-veranda', 1000, 3),
      person('aibur-family', 980, 660, 0, 150, 5),
      ...foliage(), ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.2, 1)
      slide(tl, q, ['foliage-l', 'foliage-r'], 'up', 0.4, 1.2)
      slide(tl, q, 'aibur-family', 'right', 1, 1.2)
      lines(tl, root, 3)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), idle.breathe(q, 'aibur-family')],
  },
  {
    id: 'haldi', sky: RIVER, tone: 'haldi', text: { top: 225 }, leave: 'fade', hold: 4,
    layers: [
      L('sunrise', 1500, 620, { y: 400, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), L('hero-ground', 2200, 880, { z: 2, full: true, kind: 'ground', fit: 'cover' }),
      L('haldi-backdrop', 1020, 800, { y: 190, z: 3 }),
      // the groom's forearm is its own picture so his hand can put haldi on her cheek; the cuff sits over its root
      person('haldi-couple', 1000, 677, 20, 70, 5), person('haldi-arm', 1000, 677, 20, 70, 6), person('haldi-cuff', 1000, 677, 20, 70, 6),
      L('drape-l', 260, 1500, { art: 'haldi-drape', ax: 'l', x: -40, ay: 't', y: -20, z: 7 }),
      L('drape-r', 260, 1500, { art: 'haldi-drape', ax: 'r', x: -40, ay: 't', y: -20, z: 7, flip: true }),
      ...foliage(), ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'drape-l', 'left', 0.2, 1.2)
      slide(tl, q, 'drape-r', 'right', 0.2, 1.2)
      slide(tl, q, ['foliage-l', 'foliage-r'], 'up', 0.4, 1.2)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.4, 1)
      for (const id of ['haldi-couple', 'haldi-arm', 'haldi-cuff']) slide(tl, q, id, 'right', 1, 1.2)
      lines(tl, root, 2.6)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), ...['haldi-couple', 'haldi-arm', 'haldi-cuff'].map((id) => idle.breathe(q, id)), idle.haldi(q, 'haldi-arm')],
  },
  {
    id: 'sangeet', sky: STAGE, tone: 'stage', stars: true, text: { top: 150 }, below: true, leave: 'cut', hold: 4,
    layers: [
      ground('sangeet-stage', 1800, 2, 1500),
      person('sangeet-groom', 520, 800, -170, 90, 5), person('sangeet-bride', 560, 790, 150, 80, 6),
      ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'sangeet-bride', 'right', 0.2, 1.3)
      slide(tl, q, 'sangeet-groom', 'left', 0.4, 1.3)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.1, 1.2)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...petals(q), idle.lean(q, 'sangeet-groom', 2.2, 0.75), idle.lean(q, 'sangeet-bride', -2.2, 0.75)],
  },
  {
    // the couple on their sofa on the wedding stage (the stage's own sofa is painted out, scripts/wedding-stage.py)
    id: 'wedding', sky: WED, tone: 'wedding', text: { top: 130 }, below: true, leave: 'fade', hold: 5,
    layers: [
      ground('wedding-stage', 1900, 2, 1700),
      L('wedding-sofa', 1120, 450, { y: 100, z: 4 }),
      person('wedding-groom', 400, 670, -125, 70, 5), person('wedding-bride', 450, 670, 150, 50, 6),
      ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'wedding-bride', 'right', 0.8, 1)
      slide(tl, q, 'wedding-groom', 'left', 1.4, 0.9)
      lines(tl, root, 2.8)
    },
    idle: (q) => [...petals(q), idle.lean(q, 'wedding-groom', 0.7, 2), idle.lean(q, 'wedding-bride', -0.7, 2.2)],
  },
  {
    id: 'reception', sky: RECEPTION, tone: 'stage', stars: true, text: { top: 170 }, below: true, leave: 'fade', hold: 4,
    layers: [
      ground('reception-hall', 1900, 2, 1700),
      person('reception-groom', 380, 760, -170, 110, 5), person('reception-bride', 430, 745, 170, 100, 6),
      L('reception-table', 620, 300, { y: 40, z: 7 }),
      ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.3, 1)
      slide(tl, q, 'reception-bride', 'right', 0.8, 1.1)
      slide(tl, q, 'reception-groom', 'left', 1, 1.1)
      slide(tl, q, 'reception-table', 'down', 1.6, 0.9)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...petals(q), idle.breathe(q, 'reception-groom'), idle.lean(q, 'reception-bride', -0.7, 2)],
  },
  {
    id: 'closing', card: 'right', sky: RIVER, tone: 'day', text: { top: 78 }, hold: 8,
    layers: [
      L('sunrise', 1500, 620, { y: 300, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), ground('river-ground', 690, 3),
      L('river-boat', 260, 120, { x: 250, y: BOAT_Y, z: 4 }),
      L('foliage-l', 480, 480, { art: 'foliage-corner', ax: 'l', x: -70, ay: 't', y: -70, z: 8, kind: 'plant' }),
      ...flowers('flowers-lotus'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0, 0.8)
      slide(tl, q, 'foliage-l', 'up', 0.1, 1)
      slide(tl, q, 'river-props', 'left', 0.5, 0.8)
      lines(tl, root, 1.8, { step: 0.5 })
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), idle.sway(q, 'foliage-l', 1.2, 3.2, '0% 0%'), idle.drift(q, 'river-boat', 60, 8)],
  },
]
