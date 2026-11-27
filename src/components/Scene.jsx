import { forwardRef, useImperativeHandle, useLayoutEffect, useRef } from 'react'
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
    return () => ctx.revert()
  }, [scene, lang]) // a new language swaps the words, so the text tweens are rebuilt

  useImperativeHandle(ref, () => ({
    el: root.current,
    leave: scene.leave,
    hold: scene.hold || 4,
    enter(restart) {
      live.current = true
      root.current.classList.add('is-live')
      idles.current.forEach((i) => i.play())
      if (restart) tl.current.restart()
      else if (tl.current.progress() < 1) tl.current.play()
    },
    exit() {
      live.current = false
      root.current.classList.remove('is-live')
      idles.current.forEach((i) => i.pause())
      tl.current.pause()
    },
    reset() { if (!still()) tl.current.pause(0) },
    finish() { tl.current.progress(1) },
    progress: () => tl.current.progress(),
    done: (cb) => { tl.current.eventCallback('onComplete', cb) },
  }), [scene])

  return (
    <section ref={root} id={scene.id} className={`scene tone-${scene.tone}${scene.card === 'right' ? ' card-right' : ''}`} style={{ background: scene.sky }}>
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
