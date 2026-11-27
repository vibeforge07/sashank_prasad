import { gsap } from 'gsap'

// The invitation card turns with the guest's own swipe, wheel or arrow keys, the way a scroll would,
// but its section stays one screen tall like every other scene. (A section several screens tall,
// pinned inside the snapping reel, stuttered and stuck on phones.)
// While the finger moves, the card moves with it; on release it glides on to the next resting point:
// the card out of the envelope and facing you, then each page turned. Once the last page is down,
// the page scrolls on as usual.
const PER_SCREEN = 2.4 // seconds of the card per screen height of finger travel
const clamp = gsap.utils.clamp(0, 1)

export function drive(t, el) {
  const sc = el.closest('.reel')
  const dur = t.duration()
  // resting points, as progress: the start, every `rest` label in the timeline, the end
  const rests = [...new Set([0, ...Object.entries(t.labels).filter(([k]) => k.startsWith('rest')).map(([, v]) => v / dur), 1])].sort((a, b) => a - b)
  const aligned = () => Math.abs(sc.scrollTop - el.offsetTop) < 3
  const open = () => t.progress() > 0.999
  // the card takes the guest's touches only while it fills the screen and has pages left to turn
  const grab = () => el.classList.toggle('grab', aligned() && !open())
  let tw = null

  const to = (p, duration, ease) => {
    el.dataset.back = p < t.progress() ? '1' : '0'
    tw = gsap.to(t, { progress: p, duration, ease, overwrite: true, onComplete: grab })
    return tw
  }
  const scrub = (p) => to(clamp(p), 0.28, 'power3.out')
  // glide to the next resting point in the swipe's direction (or back to the nearest one)
  const settle = (dir, speed = 1.8) => {
    const p = t.progress()
    const r = dir > 0 ? rests.find((x) => x > p + 1e-4) ?? 1
      : dir < 0 ? [...rests].reverse().find((x) => x < p - 1e-4) ?? 0
        : rests.reduce((a, b) => (Math.abs(b - p) < Math.abs(a - p) ? b : a))
    return to(r, gsap.utils.clamp(0.35, 2.4, (Math.abs(r - p) * dur) / speed), 'power2.out')
  }
  const step = (dy) => (dy / el.clientHeight) * PER_SCREEN / dur
  const back = () => { const prev = el.previousElementSibling; if (prev) sc.scrollTo({ top: prev.offsetTop, behavior: 'smooth' }) }

  // touch
  let y0 = 0; let y = 0; let p0 = 0; let v = 0; let ts = 0; let mine = false
  const start = (e) => {
    mine = e.touches.length === 1 && el.classList.contains('grab')
    if (!mine) return
    gsap.killTweensOf(t)
    y0 = y = e.touches[0].clientY; ts = e.timeStamp; v = 0; p0 = t.progress()
  }
  const move = (e) => {
    if (!mine) return
    e.preventDefault()
    const ny = e.touches[0].clientY
    v = 0.7 * v + 0.3 * ((y - ny) / Math.max(1, e.timeStamp - ts)); y = ny; ts = e.timeStamp
    // pulling back past the closed envelope: let go to the scene above on release
    if (p0 <= 0.001 && y0 - y < 0) return
    scrub(p0 + step(y0 - y))
  }
  const end = () => {
    if (!mine) return
    mine = false
    const dy = y0 - y
    if (Math.abs(dy) < 8) return // a tap
    if (p0 <= 0.001 && dy < -40) { back(); return }
    settle(Math.sign(dy + v * 120))
  }

  // wheel and trackpad: one gesture is a run of events less than 200 ms apart
  let wheel = 0; let quiet = 0; let wp0 = 0; let wAll = 0
  const onWheel = (e) => {
    const fresh = e.timeStamp - wheel > 200
    wheel = e.timeStamp
    if (fresh) { wp0 = t.progress(); wAll = 0 }
    if (!aligned() || wp0 > 0.999 || (wp0 <= 0.001 && e.deltaY < 0 && wAll <= 0)) return
    e.preventDefault()
    const d = e.deltaY * (e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? el.clientHeight : 1)
    wAll += d
    scrub(t.progress() + step(d))
    clearTimeout(quiet)
    quiet = setTimeout(() => settle(Math.sign(wAll)), 160)
  }

  const onKey = (e) => {
    if (!aligned() || open() || e.target.closest?.('button,a,input')) return
    const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0
    if (!dir || (dir < 0 && t.progress() <= 0.001)) return
    e.preventDefault()
    settle(dir)
  }

  // after the guest has gone back above the card, it is a closed envelope again
  const onScroll = () => {
    if (sc.scrollTop <= el.offsetTop - el.clientHeight + 2 && t.progress() > 0) { gsap.killTweensOf(t); t.progress(0) }
    grab()
  }

  el.addEventListener('touchstart', start, { passive: true })
  el.addEventListener('touchmove', move, { passive: false })
  el.addEventListener('touchend', end)
  el.addEventListener('touchcancel', end)
  el.addEventListener('wheel', onWheel, { passive: false })
  window.addEventListener('keydown', onKey)
  sc.addEventListener('scroll', onScroll, { passive: true })
  grab()

  return {
    // autoplay: the card at its own pace, a breath at every resting point, then `done`
    run(done) {
      let wait = null
      const next = () => {
        if (open()) { done(); return }
        const p = t.progress()
        const r = rests.find((x) => x > p + 1e-4) ?? 1
        to(r, (r - p) * dur, 'none').eventCallback('onComplete', () => { grab(); wait = gsap.delayedCall(r < 1 ? 1.1 : 0, next) })
      }
      wait = gsap.delayedCall(0.6, next)
      return () => { wait?.kill(); if (tw?.vars.ease === 'none') tw.kill() }
    },
    off() {
      clearTimeout(quiet)
      gsap.killTweensOf(t)
      el.classList.remove('grab')
      el.removeEventListener('touchstart', start)
      el.removeEventListener('touchmove', move)
      el.removeEventListener('touchend', end)
      el.removeEventListener('touchcancel', end)
      el.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      sc.removeEventListener('scroll', onScroll)
    },
  }
}
