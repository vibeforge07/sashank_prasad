import { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import Layer from './Layer.jsx'
import { makeQ } from '../scenes/motion.js'
import { drive } from './drive.js'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// Holds one scene's timeline and idle loops. App decides which scene is on screen.
export default forwardRef(function Scene({ scene, lang, children }, ref) {
  const root = useRef(null)
  const tl = useRef(null)
  const idles = useRef([])
  const live = useRef(false)
  const [size, setSize] = useState(0)
  const driver = useRef(null)

  // the card is laid out for the screen: build it again when the screen really changes size
  // (not for the few pixels a phone's address bar takes)
  useEffect(() => {
    if (!scene.scroll) return
    let t
    let was = [window.innerWidth, window.innerHeight]
    const on = () => {
      clearTimeout(t)
      t = setTimeout(() => {
        const now = [window.innerWidth, window.innerHeight]
        if (now[0] === was[0] && Math.abs(now[1] - was[1]) < was[1] * 0.15) return
        was = now
        setSize((n) => n + 1)
      }, 200)
    }
    window.addEventListener('resize', on)
    return () => { clearTimeout(t); window.removeEventListener('resize', on) }
  }, [scene])

  useLayoutEffect(() => {
    const progress = tl.current?.progress() || 0
    const ctx = gsap.context(() => {
      const t = gsap.timeline({ paused: true })
      scene.play(t, makeQ(root.current), root.current)
      t.progress(still() ? 1 : progress)
      if (live.current && progress < 1 && !scene.scroll) t.play()
      tl.current = t
      idles.current = still() ? [] : scene.idle(makeQ(root.current)).filter(Boolean)
      if (!live.current) idles.current.forEach((i) => i.pause())
    }, root)
    // the card turns with the guest's own swipe (components/drive.js)
    let off = () => {}
    if (scene.scroll && !still()) { const d = drive(tl.current, root.current); driver.current = d; off = () => { d.off(); driver.current = null } }
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
    reset() { if (!still()) { gsap.killTweensOf(tl.current); tl.current.pause(0) } },
    finish() { if (!scene.scroll) tl.current.progress(1) },
    scroll: !!scene.scroll,
    // autoplay through the card; returns a function that stops it
    run: (done) => (driver.current ? driver.current.run(done) : (done(), () => {})),
    progress: () => tl.current.progress(),
    done: (cb) => { tl.current.eventCallback('onComplete', cb) },
  }), [scene])

  return (
    <section ref={root} id={scene.id} className={`scene${scene.scroll ? ' swipe' : ''} tone-${scene.tone}${scene.card === 'right' ? ' card-right' : ''}`} style={{ background: scene.sky }}>
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
