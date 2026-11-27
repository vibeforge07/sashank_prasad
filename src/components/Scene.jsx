import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Layer from './Layer.jsx'
import { makeQ } from '../scenes/motion.js'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Holds one scene's timeline and idle loops. App decides which scene is on screen.
export default forwardRef(function Scene({ scene, lang, children }, ref) {
  const root = useRef(null)
  const tl = useRef(null)
  const idles = useRef([])
  const live = useRef(false)
  const [size, setSize] = useState(0)

  // a scroll scene is laid out for the screen: build it again after a resize
  useEffect(() => {
    if (!scene.scroll) return
    let t
    const on = () => { clearTimeout(t); t = setTimeout(() => setSize((n) => n + 1), 200) }
    window.addEventListener('resize', on)
    return () => { clearTimeout(t); window.removeEventListener('resize', on) }
  }, [scene])

  useLayoutEffect(() => {
    const progress = tl.current?.progress() || 0
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true })
      scene.play(t, makeQ(root.current), root.current)
      t.progress(still() ? 1 : progress)
      if (live.current && progress < 1) t.play()
      tl.current = t
      idles.current = still() ? [] : scene.idle(makeQ(root.current)).filter(Boolean)
      if (!live.current) idles.current.forEach((i) => i.pause())
    }, root)
    // A scroll scene is several screens tall with its picture pinned, and the guest's scroll moves
    // its timeline (like a scrubbed ScrollTrigger): about 0.42 screens of scroll per second of it.
    let off = () => {}
    if (scene.scroll) {
      const t = tl.current
      const el = root.current
      const sc = el.closest('.reel')
      el.style.height = `${Math.round(100 * (1 + t.duration() * 0.42))}svh`
      let last = sc.scrollTop
      const at = () => gsap.utils.clamp(0, 1, (sc.scrollTop - el.offsetTop) / Math.max(1, el.offsetHeight - sc.clientHeight))
      t.progress(still() ? 1 : at())
      const on = () => {
        el.dataset.back = sc.scrollTop < last ? '1' : '0'
        last = sc.scrollTop
        if (!still()) gsap.to(t, { progress: at(), duration: 0.7, ease: 'power2.out', overwrite: true })
      }
      sc.addEventListener('scroll', on, { passive: true })
      off = () => { sc.removeEventListener('scroll', on); gsap.killTweensOf(t) }
    }
    return () => { off(); ctx.revert() }
  }, [scene, lang, size]) // a new language swaps the words, so the text tweens are rebuilt

  useImperativeHandle(ref, () => ({
    el: root.current,
    leave: scene.leave,
    hold: scene.hold || 4,
    enter(restart) {
      live.current = true
      root.current.classList.add('is-live')
      idles.current.forEach((i) => i.play())
      if (scene.scroll) return
      if (restart) tl.current.restart()
      else if (tl.current.progress() < 1) tl.current.play()
    },
    exit() {
      live.current = false
      root.current.classList.remove('is-live')
      idles.current.forEach((i) => i.pause())
      if (!scene.scroll) tl.current.pause()
    },
    reset() { if (!still() && !scene.scroll) tl.current.pause(0) },
    finish() { if (!scene.scroll) tl.current.progress(1) },
    scroll: !!scene.scroll,
    // what the page watches to know this scene is on screen: a tall scene's pinned picture
    watch: scene.scroll ? root.current.querySelector('.stage') : root.current,
    progress: () => tl.current.progress(),
    done: (cb) => { tl.current.eventCallback('onComplete', cb) },
  }), [scene])

  return (
    <section ref={root} id={scene.id} className={`scene${scene.scroll ? ' tall' : ''} tone-${scene.tone}${scene.card === 'right' ? ' card-right' : ''}`} style={{ background: scene.sky }}>
      <div className="stage">
        <div className="world">
          {scene.stars && <div className="stars" />}
          {scene.moon && <div className="moon" style={{ left: `calc(50% + ${scene.moon.x} * var(--u) + var(--dx))`, bottom: `calc(${scene.moon.y} * var(--u))`, width: `calc(${scene.moon.s} * var(--u))` }} />}
          {scene.layers.map((l) => <Layer key={l.id} {...l} />)}
          {scene.own ? children : <div className="words" style={{ '--top': scene.text.top }}><i className="card" data-t="-0.4" />{children}</div>}
        </div>
      </div>
    </section>
  )
})
