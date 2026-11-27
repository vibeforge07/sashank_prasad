import { useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { artUrl } from '../art/index.js'
import ring from '../opening/ring.webp'
import sindoor from '../opening/sindoor.webp'
import paper from '../opening/paper.webp'
import { petals } from './petals.js'

const still = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// The cover: a sindoor seal on cream paper. One tap and the sindoor spreads
// over the whole screen, the red page lifts away, and the doors open on the wedding.
export default function Gate({ c, lang, langs, names, setLang, onTap, onOpen, onGone }) {
  const root = useRef(null)
  const busy = useRef(false)
  const q = (s) => root.current.querySelector(s)

  useLayoutEffect(() => {
    if (still()) return
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.15 })
      tl.from('.g-garland', { yPercent: -100, duration: 1, ease: 'power3.out' }, 0)
      tl.from('.g-mala', { yPercent: -100, duration: 1.2, ease: 'power3.out', stagger: 0.1 }, 0.3)
      tl.from('.g-pais', { autoAlpha: 0, duration: 1.4 }, 0.4)
      tl.from('.g-flowers', { yPercent: 100, duration: 1, ease: 'power3.out' }, 1)
      tl.from('.g-disc', { scale: 0.25, autoAlpha: 0, duration: 0.8, ease: 'back.out(1.6)' }, 0.3)
      tl.from('.g-ring', { scale: 0.7, autoAlpha: 0, duration: 1.3, ease: 'power3.out' }, 0.75)
      tl.from('.g-title span', { y: 14, autoAlpha: 0, duration: 0.7, stagger: 0.18, ease: 'power2.out' }, 1.1)
      tl.from('.g-bed-l', { xPercent: -110, duration: 1.3, ease: 'power3.out' }, 1.1)
      tl.from('.g-bed-r', { xPercent: 110, duration: 1.3, ease: 'power3.out' }, 1.25)
      gsap.to('.g-mala', { rotation: 1.2, duration: 2.6, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 1.6, stagger: 0.7 })
      tl.from(['.g-inv', '.g-names', '.g-date'], { y: 14, autoAlpha: 0, duration: 0.8, stagger: 0.15, ease: 'power2.out' }, 1.4)
      tl.from(['.g-langs', '.g-hint'], { autoAlpha: 0, duration: 0.8, stagger: 0.2 }, 2)
      gsap.to('.g-ring', { rotation: 360, duration: 120, ease: 'none', repeat: -1 })
      gsap.fromTo('.g-pulse', { scale: 0.95, autoAlpha: 0.9 }, { scale: 1.5, autoAlpha: 0, duration: 2.6, ease: 'power1.out', repeat: -1, delay: 2.2 })
      gsap.to('.g-hint', { opacity: 0.45, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut', delay: 2.8 })
    }, root)
    return () => ctx.revert()
  }, [])

  const open = () => {
    if (busy.current) return
    busy.current = true
    onTap?.()
    if (still()) { onOpen(); onGone(); return }
    const seal = q('.g-seal').getBoundingClientRect()
    const cx = seal.left + seal.width / 2
    const cy = seal.top + seal.height / 2
    const far = Math.max(Math.hypot(cx, cy), Math.hypot(innerWidth - cx, cy), Math.hypot(cx, innerHeight - cy), Math.hypot(innerWidth - cx, innerHeight - cy))
    const cover = (far * 2.15) / q('.g-flood').offsetWidth
    const box = q('.g-petals')
    petals(box, 34, { x: cx, y: cy })

    const tl = gsap.timeline()
    tl.to('.g-seal', { scale: 0.94, duration: 0.12, yoyo: true, repeat: 1 }, 0)
    tl.to(['.g-langs', '.g-hint', '.g-pulse'], { autoAlpha: 0, duration: 0.3 }, 0)
    tl.to('.g-flood', { scale: cover, duration: 1.6, ease: 'power2.in' }, 0.1)
    tl.to('.g-garland', { yPercent: -110, duration: 1, ease: 'power2.in' }, 0.2)
    tl.to('.g-mala', { yPercent: -110, duration: 1, ease: 'power2.in' }, 0.2)
    tl.to('.g-bed-l', { xPercent: -120, duration: 1, ease: 'power2.in' }, 0.25)
    tl.to('.g-bed-r', { xPercent: 120, duration: 1, ease: 'power2.in' }, 0.25)
    tl.to('.g-flowers', { yPercent: 110, duration: 1, ease: 'power2.in' }, 0.25)
    tl.to('.g-names', { color: '#f1cf7c', duration: 0.5 }, 0.8)
    tl.to(['.g-inv', '.g-date'], { color: '#fff1d6', duration: 0.5 }, 0.8)
    tl.to('.g-seal', { scale: 1.08, duration: 1.6, ease: 'power1.inOut' }, 0.2)
    // the red page lifts away and shows the doors
    tl.to('.g-page', { yPercent: -100, duration: 1.15, ease: 'power3.inOut' }, 2.2)
    tl.call(() => onOpen(), null, 3.15)
    tl.to('.g-door-l', { rotationY: -104, duration: 1.5, ease: 'power2.inOut' }, 3.4)
    tl.to('.g-door-r', { rotationY: 104, duration: 1.5, ease: 'power2.inOut' }, 3.4)
    tl.fromTo('.g-light', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, yoyo: true, repeat: 1, ease: 'sine.inOut' }, 3.45)
    tl.call(() => petals(box, 26), null, 3.5)
    tl.to('.g-doors', { autoAlpha: 0, duration: 0.4 }, 4.75)
    tl.call(() => onGone(), null, 8)
  }

  return (
    <div className="gate" ref={root}>
      <div className="g-doors" aria-hidden="true">
        <div className="g-light" />
        <div className="g-door g-door-l"><i className="g-panel" /><i className="g-panel" /><b className="g-knock" /></div>
        <div className="g-door g-door-r"><i className="g-panel" /><i className="g-panel" /><b className="g-knock" /></div>
      </div>

      <div className="g-page" style={{ backgroundImage: `url(${paper})` }}>
        <img className="g-pais g-pais-l" src={artUrl('gate-paisley')} alt="" />
        <img className="g-pais g-pais-r" src={artUrl('gate-paisley')} alt="" />
        {['l', 'r'].flatMap((s) => [1, 2, 3, 4, 5, 6].map((n) => <img key={s + n} className={`g-mala g-mala-${s} g-m${n}`} src={artUrl('gate-mala')} alt="" />))}
        <div className="g-garland" style={{ backgroundImage: `url(${artUrl('gate-toran')})` }} />
        <div className="g-flowers" style={{ backgroundImage: `url(${artUrl('gate-flowers')})` }} />
        <img className="g-bed g-bed-l" src={artUrl('gate-elephant')} alt="" />
        <img className="g-bed g-bed-r" src={artUrl('gate-thali')} alt="" />

        <div className="g-inner">
          <p className="g-inv">{c.hero.invocation}</p>
          <button className="g-seal" onClick={open} aria-label={c.gate.open}>
            <span className="g-flood" />
            <img className="g-ring" src={ring} alt="" />
            <img className="g-disc" src={sindoor} alt="" />
            <span className="g-title" lang={lang}>{c.gate.seal.map((w) => <span key={w}>{w}</span>)}</span>
            <span className="g-pulse" />
          </button>
          <h1 className="g-names">{names}</h1>
          <p className="g-date">{c.gate.date}</p>
          <div className="g-langs" role="group" aria-label={c.gate.choose}>
            {langs.map(([l, label]) => <button key={l} lang={l} aria-pressed={l === lang} onClick={() => setLang(l)}>{label}</button>)}
          </div>
          <button className="g-hint" onClick={open}>{c.gate.tap}</button>
        </div>
      </div>
      <div className="g-petals" aria-hidden="true" />
    </div>
  )
}
