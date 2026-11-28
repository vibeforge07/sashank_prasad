import { slide, rise, lines, idle } from './motion.js'
import { playInvitation, idleInvitation } from './invitation.js'
import { playDate, idleDate } from './date.js'
import { playClosing, idleClosing } from './closing.js'

// Each scene: sky, layers, where its text sits, the intro timeline and the idle motion.
// `leave` is how autoplay goes to the next scene: a hard cut or a cross-fade, as in the film.

const L = (id, w, h, o = {}) => ({ id, w, h, ...o })
const clouds = (night) => [
  L('cloud-l', 300, 190, { art: night ? 'cloud-night' : 'cloud-white', ax: 'l', x: -150, ay: 't', y: 380, z: 2 }),
  L('cloud-r', 360, 225, { art: night ? 'cloud-night' : 'cloud-white', ax: 'r', x: -260, ay: 't', y: 640, z: 2, flip: true }),
]
const cloudIdle = (q) => [idle.drift(q, 'cloud-l', 26, 9), idle.drift(q, 'cloud-r', 34, 11)].filter(Boolean)
const foliage = (z = 8) => [L('foliage-l', 430, 430, { art: 'foliage-corner', ax: 'l', x: -70, ay: 't', y: -60, z, kind: 'plant' }), L('foliage-r', 430, 430, { art: 'foliage-corner', ax: 'r', x: -70, ay: 't', y: -60, z, flip: true, kind: 'plant' })]
const flowers = (art, z = 9) => [L('fg-l', 520, 290, { art, ax: 'l', x: -60, y: -30, z, kind: 'plant' }), L('fg-r', 520, 290, { art, ax: 'r', x: -60, y: -30, z, flip: true, kind: 'plant' })]
const person = (id, w, h, x, y, z) => L(id, w, h, { x, y, z, kind: 'person' })
const ground = (id, h, z = 2, w = 2200) => L(id, w, h, { z, full: true, kind: 'ground', fit: 'cover' })
const petals = (q) => [idle.sway(q, 'fg-l', 0.9, 2.8, '0% 100%'), idle.sway(q, 'fg-r', 0.9, 3.1, '100% 100%')]
// the corner drapes swing a little from the top
const drapes = (q) => [idle.sway(q, 'drape-l', 0.8, 3.6, '0% 0%'), idle.sway(q, 'drape-r', 0.8, 4.1, '100% 0%')]
const leaves = (q) => [idle.sway(q, 'foliage-l', 1.2, 3.2, '0% 0%'), idle.sway(q, 'foliage-r', 1.2, 2.9, '100% 0%')]

const CALM = 'linear-gradient(#a9cbe0 0%, #bcd6e2 45%, #d9e2dc 75%, #eadfcc 100%)'
const DAY = 'linear-gradient(#b3cfc0 0%, #cfd6b4 34%, #f3cf9b 56%, #f6b183 78%)'
const RIVER = 'linear-gradient(#77c2c9 0%, #b9d6bd 22%, #f2e1a6 48%, #f8c98f 74%)'
const NIGHT = 'linear-gradient(#0b0d24 0%, #15133a 40%, #3a1b4d 72%, #63284f 92%)'
const STAGE = 'linear-gradient(#120f33 0%, #2a1a63 45%, #43268c 78%)'
// the wedding night
// the reception: a plum night
const RECEPTION = 'linear-gradient(#120a26 0%, #26123f 45%, #431b45 80%, #52203f 100%)'
const WED = 'linear-gradient(#0a0e2c 0%, #121a4a 50%, #1e2a66 100%)'

// the boat floats on the river, not on the bank

export const SCENES = [
  {
    id: 'hero', sky: CALM, tone: 'day', text: { top: 85 }, leave: 'cut', hold: 4,
    layers: [
      L('intro-sky', 768, 1376, { z: 0, fit: 'fill' }),
      // sun and sunset clouds
      L('sun-t', 360, 360, { art: 'intro-sun', x: 255, y: 800, z: 1 }),
      L('sun-w', 320, 320, { art: 'intro-sun', x: 260, y: 780, z: 1 }),
      L('cloud-a-t', 540, 160, { art: 'intro-cloud-a', ax: 'l', x: -50, y: 1060, z: 2 }),
      L('cloud-b-t', 450, 103, { art: 'intro-cloud-b', ax: 'r', x: -30, y: 980, z: 2 }),
      L('cloud-a-w', 480, 143, { art: 'intro-cloud-a', ax: 'l', x: 40, y: 1140, z: 2 }),
      L('cloud-b-w', 400, 91, { art: 'intro-cloud-b', ax: 'r', x: 40, y: 1080, z: 2 }),
      // distant hills
      L('mountains-t', 1913, 270, { art: 'intro-mountains', y: 650, z: 3, repeat: true }),
      L('mountains-w', 1913, 250, { art: 'intro-mountains', y: 540, z: 3, repeat: true }),
      // Kolkata (left) and Jamshedpur (right)
      L('victoria-t', 440, 289, { art: 'intro-victoria', x: -340, y: 555, z: 4, kind: 'building' }),
      L('steel-t', 580, 336, { art: 'intro-steel-plant', x: 270, y: 550, z: 4, kind: 'building' }),
      L('howrah-t', 690, 170, { art: 'intro-howrah-bridge', x: -250, y: 515, z: 5, kind: 'building' }),
      L('victoria-w', 440, 289, { art: 'intro-victoria', x: -450, y: 470, z: 4, kind: 'building' }),
      L('steel-w', 560, 325, { art: 'intro-steel-plant', x: 320, y: 480, z: 4, kind: 'building' }),
      L('howrah-w', 720, 178, { art: 'intro-howrah-bridge', x: -290, y: 440, z: 5, kind: 'building' }),
      // greenery, school & diamond
      L('trees-t', 1914, 240, { art: 'intro-trees', y: 405, z: 5, repeat: true }),
      L('trees-w', 1914, 220, { art: 'intro-trees', y: 360, z: 5, repeat: true }),
      L('school-t', 500, 243, { art: 'intro-school', x: 20, y: 410, z: 6, kind: 'building' }),
      L('diamond-t', 270, 237, { art: 'intro-diamond', x: 345, y: 420, z: 7 }),
      L('school-w', 480, 233, { art: 'intro-school', x: 30, y: 360, z: 6, kind: 'building' }),
      L('diamond-w', 250, 220, { art: 'intro-diamond', x: 480, y: 365, z: 7 }),
      // river and boats
      L('river-t', 1914, 140, { art: 'intro-river', y: 310, z: 7, repeat: true }),
      L('river-w', 1914, 120, { art: 'intro-river', y: 280, z: 7, repeat: true }),
      L('boat-a-t', 195, 70, { art: 'intro-boat-a', x: -330, y: 375, z: 8 }),
      L('boat-b-t', 135, 87, { art: 'intro-boat-b', x: -120, y: 390, z: 8 }),
      L('boat-a-w', 185, 66, { art: 'intro-boat-a', x: -370, y: 335, z: 8 }),
      L('boat-b-w', 130, 84, { art: 'intro-boat-b', x: -160, y: 350, z: 8 }),
      // road, lamps, tram, taxi + wheels, and foreground railing
      L('road-t', 1914, 350, { art: 'intro-road', y: 40, z: 9, repeat: true }),
      L('road-w', 1914, 315, { art: 'intro-road', y: 35, z: 9, repeat: true }),
      L('lamp-1-t', 76, 356, { art: 'intro-lamp-post', x: -370, y: 295, z: 10 }),
      L('lamp-2-t', 76, 356, { art: 'intro-lamp-post', x: 320, y: 295, z: 10 }),
      L('lamp-1-w', 70, 328, { art: 'intro-lamp-post', x: -450, y: 260, z: 10 }),
      L('lamp-2-w', 70, 328, { art: 'intro-lamp-post', x: 60, y: 260, z: 10 }),
      L('lamp-3-w', 70, 328, { art: 'intro-lamp-post', x: 460, y: 260, z: 10 }),
      L('tram-t', 540, 196, { art: 'intro-tram', x: 0, y: 155, z: 10 }),
      L('tram-w', 520, 188, { art: 'intro-tram', x: 0, y: 138, z: 10 }),
      L('wheel-r-t', 64, 64, { art: 'intro-taxi-wheel', x: -117, y: 208, z: 11 }),
      L('wheel-f-t', 64, 64, { art: 'intro-taxi-wheel', x: 119, y: 208, z: 11 }),
      L('taxi-t', 420, 162, { art: 'intro-taxi', x: 0, y: 230, z: 12 }),
      L('wheel-r-w', 61, 61, { art: 'intro-taxi-wheel', x: -112, y: 184, z: 11 }),
      L('wheel-f-w', 61, 61, { art: 'intro-taxi-wheel', x: 113, y: 184, z: 11 }),
      L('taxi-w', 400, 154, { art: 'intro-taxi', x: 0, y: 205, z: 12 }),
      L('railing-t', 1914, 165, { art: 'intro-railing', y: 0, z: 13, repeat: true }),
      L('railing-w', 1914, 150, { art: 'intro-railing', y: 0, z: 13, repeat: true }),
      person('hero-groom', 470, 960, -230, 110, 14), person('hero-bride', 520, 960, 210, 110, 15),
      ...flowers('flowers-yellow', 16),
    ],
    play(tl, q, root) {
      rise(tl, q, ['mountains-t', 'mountains-w'], 0, 1.3)
      rise(tl, q, ['victoria-t', 'victoria-w', 'steel-t', 'steel-w'], 0.12, 1.2)
      rise(tl, q, ['howrah-t', 'howrah-w', 'school-t', 'school-w', 'diamond-t', 'diamond-w'], 0.22, 1.2)
      rise(tl, q, ['trees-t', 'trees-w'], 0.2, 1.1)
      for (const id of ['river-t', 'river-w', 'boat-a-t', 'boat-b-t', 'boat-a-w', 'boat-b-w']) slide(tl, q, id, 'down', 0.3, 1.0)
      for (const id of ['road-t', 'road-w', 'lamp-1-t', 'lamp-2-t', 'lamp-1-w', 'lamp-2-w', 'lamp-3-w', 'tram-t', 'tram-w', 'taxi-t', 'wheel-r-t', 'wheel-f-t', 'taxi-w', 'wheel-r-w', 'wheel-f-w']) slide(tl, q, id, 'down', 0.4, 1.0)
      for (const id of ['railing-t', 'railing-w']) slide(tl, q, id, 'down', 0.5, 0.95)
      slide(tl, q, 'hero-groom', 'left', 1.5, 1.1)
      slide(tl, q, 'hero-bride', 'right', 1.5, 1.1)
      lines(tl, root, 3, { step: 0.55 })
    },
    idle: (q) => [
      idle.glow(q, 'sun-t', 3.6), idle.glow(q, 'sun-w', 3.6),
      idle.drift(q, 'cloud-a-t', 26, 9), idle.drift(q, 'cloud-b-t', 34, 11),
      idle.drift(q, 'cloud-a-w', 28, 10), idle.drift(q, 'cloud-b-w', 36, 12),
      idle.bob(q, 'boat-a-t', 4, 2.8, 1.6), idle.drift(q, 'boat-a-t', 18, 7),
      idle.bob(q, 'boat-b-t', 4, 3.2, -1.8), idle.drift(q, 'boat-b-t', 14, 8),
      idle.bob(q, 'boat-a-w', 4, 2.8, 1.6), idle.drift(q, 'boat-a-w', 18, 7),
      idle.bob(q, 'boat-b-w', 4, 3.2, -1.8), idle.drift(q, 'boat-b-w', 14, 8),
      ...petals(q),
      idle.lean(q, 'hero-groom', 0.8, 1.7), idle.lean(q, 'hero-bride', -0.8, 1.9),
      idle.drive(q, 'taxi-w', 11, 1.5), idle.drive(q, 'wheel-r-w', 11, 1.5), idle.drive(q, 'wheel-f-w', 11, 1.5),
      idle.spin(q, 'wheel-r-w', 11, 1.5, 3600), idle.spin(q, 'wheel-f-w', 11, 1.5, 3600),
      idle.drive(q, 'tram-w', 24, 0, '85vw', '-85vw'),
      idle.drive(q, 'taxi-t', 8, 1.5), idle.drive(q, 'wheel-r-t', 8, 1.5), idle.drive(q, 'wheel-f-t', 8, 1.5),
      idle.spin(q, 'wheel-r-t', 8, 1.5, 2880), idle.spin(q, 'wheel-f-t', 8, 1.5, 2880),
      idle.drive(q, 'tram-t', 18, 0, '85vw', '-85vw'),
    ],
  },
  {
    // the invitation card itself: envelope, seal, cover, pages (scenes/invitation.js),
    // on the crimson of the opening seal, under the same toran and marigold strands
    id: 'family', own: true, scroll: true, sky: 'radial-gradient(70% 60% at 50% 38%, #96203069, #0000 72%), radial-gradient(130% 100% at 50% 50%, #0000 45%, #160207a8), #6e1423', tone: 'day', text: { top: 0 }, leave: 'cut', hold: 2,
    layers: [],
    play: (tl, q, root) => playInvitation(tl, root),
    idle: (q) => idleInvitation(q),
  },
  {
    // the wedding date on its own page, under gold foil, on a lamplit night (components/Words.jsx DatePage, scenes/date.js);
    // autoplay waits here until the guest has scratched it open
    id: 'date', own: true, sky: 'radial-gradient(120% 80% at 50% 40%, #3b2674 0%, #24185c 38%, #150f3c 72%, #0b0926 100%)', tone: 'wedding', stars: true, text: { top: 0 }, leave: 'cut', hold: 9,
    layers: [],
    play: (tl, q, root) => playDate(tl, root),
    idle: (q) => idleDate(q),
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
      person('mehendi-couple', 950, 682, -10, 40, 5),
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
    // the reference film's Sangeet, laid out like Haldi and Mehendi: a purple night, strands of flowers and lights
    // hanging from the top, lavender drapes at the two top corners, the client's lavender-and-gold stage drawn small
    // at the bottom, candle stands at the sides, the couple dancing in front
    id: 'sangeet', sky: STAGE, tone: 'stage', stars: true, text: { top: 250 }, leave: 'cut', hold: 4,
    layers: [
      // a garden of fairy-lit trees behind the stage, the dance floor in front of it, and on laptops the dhol and
      // harmonium beside the groom
      // laptops: the garden repeats across the whole width; phones: the whole garden, as wide as the screen,
      // lifted so its lit trees show above the stage, its lawn carrying on down behind it
      L('garden-w', 1500, 645, { art: 'sangeet-garden', y: 150, z: 1, repeat: true }),
      L('garden-t', 1080, 464, { art: 'sangeet-garden', y: 820, z: 1, full: true, base: '#8c8401' }),
      L('sangeet-floor', 2200, 267, { z: 1, full: true, kind: 'ground' }),
      L('sangeet-music', 660, 297, { y: 25, x: -720, z: 4 }),
      L('sangeet-stage-small', 1250, 668, { y: 330, z: 2 }),
      L('candle-l', 200, 763, { art: 'sangeet-candles', ax: 'l', x: 6, y: 70, z: 4 }),
      L('candle-r', 200, 763, { art: 'sangeet-candles', ax: 'r', x: 6, y: 70, z: 4, flip: true }),
      person('sangeet-groom', 450, 692, -150, 130, 5), person('sangeet-bride', 485, 684, 130, 120, 6),
      ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      rise(tl, q, ['garden-w', 'garden-t'], 0.2, 1.8)
      slide(tl, q, 'sangeet-music', 'left', 0.6, 1.1)
      slide(tl, q, ['candle-l'], 'left', 0.1, 1.1)
      slide(tl, q, ['candle-r'], 'right', 0.1, 1.1)
      slide(tl, q, 'sangeet-bride', 'right', 0.3, 1.3)
      slide(tl, q, 'sangeet-groom', 'left', 0.5, 1.3)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.1, 1.2)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...petals(q), idle.lean(q, 'sangeet-groom', 2.2, 0.75), idle.lean(q, 'sangeet-bride', -2.2, 0.75)],
  },
  {
    // the reference film's Wedding, laid out like Haldi and Mehendi: a moonlit night, a marigold toran across the top,
    // maroon drapes at the two top corners, the client's maroon-and-gold stage drawn small on the carpet,
    // a banana plant with its mangal ghot at each side, the couple side by side on their sofa in front
    id: 'wedding', sky: WED, tone: 'wedding', stars: true, moon: { x: 230, y: 1130, s: 120 }, text: { top: 250 }, leave: 'fade', hold: 5,
    layers: [
      L('cloud-l', 380, 167, { art: 'cloud-night', ax: 'l', x: -150, y: 1250, z: 1 }),
      L('cloud-r', 440, 193, { art: 'cloud-night', ax: 'r', x: -190, y: 1080, z: 1, flip: true }),
      // the bride's Kolkata and the groom's Jamshedpur on the skyline behind the stage, the red carpet with its alpana
      // laptops: the skyline spans the whole width; phones: the whole skyline, as wide as the screen, lifted above
      // the stage so Howrah Bridge to the Diamond all show, its garden carrying on down behind the stage
      L('city-w', 2200, 605, { art: 'wedding-city-art', y: 300, z: 2, full: true }),
      L('city-t', 1080, 297, { art: 'wedding-city-art', y: 900, z: 2, full: true, base: '#143310' }),
      L('wedding-floor', 2200, 330, { z: 2, full: true, kind: 'ground' }),
      L('wedding-stage-small', 1000, 621, { y: 330, z: 3 }),
      L('wedding-hanging', 1100, 350, { full: true, ay: 't', y: -24, z: 4 }),
      L('drape-l', 330, 842, { art: 'wedding-drape', ax: 'l', x: -60, ay: 't', y: -10, z: 3 }),
      L('drape-r', 330, 842, { art: 'wedding-drape', ax: 'r', x: -60, ay: 't', y: -10, z: 3, flip: true }),
      L('banana-l', 280, 438, { art: 'wedding-banana', ax: 'l', x: -90, y: 150, z: 7 }),
      L('banana-r', 280, 438, { art: 'wedding-banana', ax: 'r', x: -90, y: 150, z: 7, flip: true }),
      L('pheras-b', 520, 462, { art: 'wedding-pheras', y: 185, z: 5, kind: 'person', flip: true }),
      L('wedding-agni', 220, 220, { y: 115, z: 6 }),
      L('pheras-f', 600, 533, { art: 'wedding-pheras', y: 95, z: 7, kind: 'person' }),
      ...flowers('flowers-yellow'),
    ],
    play(tl, q, root) {
      slide(tl, q, 'wedding-hanging', 'up', 0, 1.1)
      rise(tl, q, ['city-w', 'city-t'], 0.2, 1.8)
      slide(tl, q, 'drape-l', 'left', 0.2, 1.2)
      slide(tl, q, 'drape-r', 'right', 0.2, 1.2)
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.2, 1)
      slide(tl, q, 'banana-l', 'left', 0.4, 1.1)
      slide(tl, q, 'banana-r', 'right', 0.4, 1.1)
      slide(tl, q, 'wedding-agni', 'down', 0.65, 1.1)
      slide(tl, q, ['pheras-f', 'pheras-b'], 'down', 0.8, 1.2)
      lines(tl, root, 2.8)
    },
    idle: (q) => [...cloudIdle(q), ...petals(q), ...drapes(q), idle.sway(q, 'banana-l', 1, 3.4, '50% 100%'), idle.sway(q, 'banana-r', 1, 3.8, '50% 100%'), idle.flicker(q, 'wedding-agni'), idle.pheras(q, 'pheras-f', 'pheras-b', 22, 5.5)],
  },
  {
    // the Reception laid out like Sangeet and Wedding, inside the hotel's hall: the client's reception stage drawn
    // small, the couple in front of it on the marble floor, the feast in front
    id: 'reception', sky: RECEPTION, tone: 'stage', stars: true, text: { top: 250 }, leave: 'fade', hold: 4,
    layers: [
      // the hall's back wall, jasmine strands across the top, the client's stage drawn small on the marble floor,
      // a silk canopy with lanterns framing it, and flower urns at its two sides
      L('reception-wall', 2200, 705, { y: 150, z: 1, full: true, kind: 'ground' }),
      L('reception-hanging', 1300, 410, { full: true, ay: 't', y: -12, z: 3 }),
      L('reception-floor', 2200, 259, { z: 2, full: true, kind: 'ground' }),
      L('reception-stage-small', 900, 533, { y: 150, z: 3 }),
      L('reception-drape', 1700, 848, { y: 110, z: 4 }),
      L('urn-l', 260, 404, { art: 'reception-urn', x: -440, y: 100, z: 5 }),
      L('urn-r', 260, 404, { art: 'reception-urn', x: 440, y: 100, z: 5, flip: true }),
      person('reception-groom', 380, 760, -170, 110, 5), person('reception-bride', 354, 760, 170, 110, 6),
      L('reception-table', 620, 300, { y: 40, z: 7 }),
      ...flowers('flowers-white'),
    ],
    play(tl, q, root) {
      slide(tl, q, ['fg-l', 'fg-r'], 'down', 0.3, 1)
      slide(tl, q, 'reception-hanging', 'up', 0, 1.1)
      slide(tl, q, 'reception-drape', 'up', 0.2, 1.2)
      slide(tl, q, 'urn-l', 'left', 0.4, 1.1)
      slide(tl, q, 'urn-r', 'right', 0.4, 1.1)
      slide(tl, q, 'reception-bride', 'right', 0.8, 1.1)
      slide(tl, q, 'reception-groom', 'left', 1, 1.1)
      slide(tl, q, 'reception-table', 'down', 1.6, 0.9)
      lines(tl, root, 2.7)
    },
    idle: (q) => [...petals(q), idle.breathe(q, 'reception-groom'), idle.lean(q, 'reception-bride', -0.7, 2)],
  },
  {
    // the last page, after the client's reference film: a carved arch on a blue night and a lamp to light with a tap,
    // then the countdown and who awaits you (components/Words.jsx Closing, scenes/closing.js)
    id: 'closing', own: true, sky: 'radial-gradient(110% 70% at 50% 70%, #2a2468 0%, #1a1650 40%, #0e0c33 75%, #080722 100%)', tone: 'wedding', stars: true, text: { top: 0 }, hold: 8,
    layers: [],
    play: (tl, q, root) => playClosing(tl, root),
    idle: (q) => idleClosing(q),
  },
]
