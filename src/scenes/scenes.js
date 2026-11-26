import { slide, rise, lines, idle } from './motion.js'

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

const DAY = 'linear-gradient(#b3cfc0 0%, #cfd6b4 34%, #f3cf9b 56%, #f6b183 78%)'
const RIVER = 'linear-gradient(#77c2c9 0%, #b9d6bd 22%, #f2e1a6 48%, #f8c98f 74%)'
const NIGHT = 'linear-gradient(#0b0d24 0%, #15133a 40%, #3a1b4d 72%, #63284f 92%)'
const STAGE = 'linear-gradient(#120f33 0%, #2a1a63 45%, #43268c 78%)'
const DUSK = 'linear-gradient(#0c1030 0%, #141a4a 48%, #1d2f6d 78%)'

// the haldi groom and his arm share one frame; the shoulder is where the arm turns
const HG = { w: 560, h: 606, shoulder: '57.9% 34%' }

export const SCENES = [
  {
    id: 'hero', sky: DAY, tone: 'day', text: { top: 85 }, leave: 'cut', hold: 4,
    layers: [
      L('sunrise', 1500, 620, { y: 700, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(),
      L('temple-l', 560, 640, { art: 'temple-dakshineswar', x: -290, y: 670, z: 3, kind: 'building' }),
      L('temple-r', 520, 680, { art: 'temple-baidyanath', x: 300, y: 670, z: 3, kind: 'building' }),
      L('tree-l', 560, 620, { art: 'tree-big', ax: 'l', x: -330, y: 640, z: 4, kind: 'plant' }),
      L('tree-r', 560, 620, { art: 'tree-big', ax: 'r', x: -330, y: 640, z: 4, flip: true, kind: 'plant' }),
      ground('hero-ground', 880, 5),
      person('hero-groom', 470, 960, -230, 110, 6), person('hero-bride', 520, 960, 210, 110, 7),
      ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      rise(tl, q, ['temple-l', 'temple-r'], 0.3, 1.2)
      slide(tl, q, 'hero-groom', 'left', 1.5, 1.1)
      slide(tl, q, 'hero-bride', 'right', 1.5, 1.1)
      lines(tl, root, 3, { step: 0.55 })
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), idle.lean(q, 'hero-groom', 0.8, 1.7), idle.lean(q, 'hero-bride', -0.8, 1.9)],
  },
  {
    id: 'family', card: 'right', sky: RIVER, tone: 'day', text: { top: 100 }, leave: 'cut', hold: 5,
    layers: [
      L('sunrise', 1500, 620, { y: 300, z: 1, full: true, kind: 'ground', fit: 'cover' }),
      ...clouds(), ground('river-ground', 690, 3),
      L('river-boat', 260, 120, { x: 250, y: 455, z: 4 }),
      L('river-props', 640, 640, { ax: 'l', x: -60, y: 40, z: 6 }),
      L('foliage-l', 480, 480, { art: 'foliage-corner', ax: 'l', x: -70, ay: 't', y: -70, z: 8, kind: 'plant' }),
      ...flowers('flowers-lotus'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.1, 0.9)
      slide(tl, q, 'foliage-l', 'up', 0.3, 1.2)
      slide(tl, q, 'river-props', 'left', 0.75, 0.9)
      lines(tl, root, 1.9, { step: 0.5 })
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), idle.sway(q, 'foliage-l', 1.2, 3.2, '0% 0%'), idle.drift(q, 'river-boat', 60, 8)],
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
      person('tilak-groom', 400, 600, 170, 120, 5), person('tilak-elder', 420, 620, -200, 110, 6),
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
      rise(tl, q, 'mehendi-couple', 1.1, 1.2)
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
      rise(tl, q, 'aibur-family', 1, 1.2)
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
      person('haldi-groom', HG.w, HG.h, -190, 90, 5), L('haldi-arm', HG.w, HG.h, { x: -190, y: 90, z: 6, kind: 'person' }),
      person('haldi-bride', 466, 654, 215, 90, 4),
      L('drape-l', 260, 1500, { art: 'haldi-drape', ax: 'l', x: -40, ay: 't', y: -20, z: 7 }),
      L('drape-r', 260, 1500, { art: 'haldi-drape', ax: 'r', x: -40, ay: 't', y: -20, z: 7, flip: true }),
      ...foliage(), ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'drape-l', 'left', 0.2, 1.2)
      slide(tl, q, 'drape-r', 'right', 0.2, 1.2)
      slide(tl, q, ['foliage-l', 'foliage-r'], 'up', 0.4, 1.2)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.4, 1)
      slide(tl, q, 'haldi-groom', 'left', 1, 1.1)
      slide(tl, q, 'haldi-arm', 'left', 1, 1.1)
      slide(tl, q, 'haldi-bride', 'right', 1.2, 1.1)
      lines(tl, root, 2.6)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), idle.breathe(q, 'haldi-groom'), idle.lean(q, 'haldi-bride', -0.6, 1.5), idle.hinge(q, 'haldi-arm', 2, -7, 1.1, HG.shoulder)],
  },
  {
    id: 'sangeet', sky: STAGE, tone: 'stage', stars: true, text: { top: 215 }, leave: 'cut', hold: 4,
    layers: [
      ground('sangeet-stage', 1800, 2, 1500),
      person('sangeet-groom', 440, 680, -200, 110, 5), person('sangeet-bride', 470, 670, 160, 100, 6),
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
    id: 'wedding', sky: DUSK, tone: 'wedding', stars: true, moon: { x: 350, y: 930, s: 90 }, text: { top: 180 }, leave: 'fade', hold: 5,
    layers: [
      ...clouds(true), ground('wedding-ground', 1120, 2, 2000),
      L('wedding-sofa', 1120, 450, { y: 100, z: 4 }),
      person('wedding-groom', 400, 670, -125, 70, 5), person('wedding-bride', 450, 670, 150, 50, 6),
      ...foliage(), ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'wedding-bride', 'right', 0.8, 1)
      slide(tl, q, 'wedding-groom', 'left', 1.4, 0.9)
      lines(tl, root, 2.8)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...leaves(q), idle.lean(q, 'wedding-groom', 0.7, 2), idle.lean(q, 'wedding-bride', -0.7, 2.2)],
  },
  {
    id: 'reception', sky: STAGE, tone: 'stage', stars: true, text: { top: 250 }, leave: 'fade', hold: 4,
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
      L('river-boat', 260, 120, { x: 250, y: 455, z: 4 }),
      L('river-props', 640, 640, { ax: 'l', x: -60, y: 40, z: 6 }),
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
