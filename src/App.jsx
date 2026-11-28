import { useCallback, useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { shower } from './components/petals.js'
import Scene from './components/Scene.jsx'
import Gate from './components/Gate.jsx'
import { Hero, Family, DatePage, EventWords, Closing } from './components/Words.jsx'
import { SCENES } from './scenes/scenes.js'
import en from './content/en.js'
import hi from './content/hi.js'
import bn from './content/bn.js'

const TEXT = { en, hi, bn }
const LANGS = ['en', 'bn', 'hi']
// every language is named in its own script, whichever language the card is in
const NATIVE = { en: 'English', bn: 'বাংলা', hi: 'हिन्दी' }
const SONGS = Object.fromEntries(
  Object.entries(import.meta.glob('./audio/*.mp3', { eager: true, query: '?url', import: 'default' }))
    .map(([path, url]) => [path.match(/\/([^/]+)\.mp3$/)?.[1], url])
)

function fadeIn(a) {
  gsap.killTweensOf(a)
  try { a.volume = 0 } catch { /* read-only on some mobile browsers */ }
  return a.play().then(() => {
    gsap.to(a, { volume: 1, duration: 1.5, ease: 'power1.out', overwrite: true })
  })
}

function firstLang() {
  const asked = new URLSearchParams(window.location.search).get('lang')
  if (TEXT[asked]) return asked
  try { const saved = localStorage.getItem('lang'); if (TEXT[saved]) return saved } catch { /* private window */ }
  return 'en'
}

const words = (id, c, lang) => {
  if (id === 'hero') return <Hero c={c} lang={lang} />
  if (id === 'family') return <Family c={c} lang={lang} />
  if (id === 'date') return <DatePage c={c} lang={lang} />
  if (id === 'closing') return <Closing c={c} lang={lang} />
  return <EventWords c={c} id={id} lang={lang} />
}

export default function App() {
  const [lang, setLang] = useState(firstLang)
  const [open, setOpen] = useState(false)
  const [started, setStarted] = useState(false)
  const [gone, setGone] = useState(false)
  const [auto, setAuto] = useState(true)
  const [sound, setSound] = useState(true)
  const [at, setAt] = useState(0)
  const scroller = useRef(null)
  const scenes = useRef([])
  const audio = useRef(null)
  const jumping = useRef(false)
  const c = TEXT[lang]
  const song = SONGS[lang] ?? Object.values(SONGS)[0]
  const prevSong = useRef(song)

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = TEXT[lang].title
    try { localStorage.setItem('lang', lang) } catch { /* private window */ }
  }, [lang])

  // whichever scene fills the screen plays; the others rest
  useEffect(() => {
    if (!open) return
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const i = scenes.current.findIndex((s) => s.el === e.target)
      if (e.isIntersecting) { scenes.current[i].enter(); setAt(i) } else scenes.current[i].exit()
    }), { root: scroller.current, threshold: 0.55 })
    scenes.current.forEach((s) => io.observe(s.el))
    return () => io.disconnect()
  }, [open])

  // Autoplay moves on by itself with the film's own cut or cross-fade: a frozen copy of
  // the scene we leave stays on top while the page underneath jumps to the next one.
  const go = useCallback((i) => {
    const from = scenes.current[at]
    const to = scenes.current[i]
    if (!to) return
    jumping.current = true
    const ghost = from.el.cloneNode(true)
    ghost.removeAttribute('id')
    ghost.classList.add('ghost')
    document.body.appendChild(ghost)
    to.reset()
    scroller.current.scrollTo({ top: to.el.offsetTop, behavior: 'instant' })
    gsap.to(ghost, {
      opacity: 0, duration: from.leave === 'fade' ? 0.9 : 0.01, ease: 'none',
      onComplete: () => { ghost.remove(); jumping.current = false },
    })
  }, [at])

  useEffect(() => {
    if (!open || !auto) return
    const s = scenes.current[at]
    let timer
    // the invitation card: autoplay opens it and turns its pages at their own pace, then moves on
    if (s.scroll) {
      const stop = s.run(() => { timer = setTimeout(() => go(at + 1), s.hold * 1000) })
      return () => { stop(); clearTimeout(timer) }
    }
    const hold = () => { timer = setTimeout(() => (at < SCENES.length - 1 ? go(at + 1) : setAuto(false)), s.hold * 1000) }
    // the wedding date is revealed by the guest's own finger: wait for it before moving on
    const wait = () => (s.el.querySelector('.scratch:not(.done)') ? s.el.addEventListener('scratched', hold, { once: true }) : hold())
    if (s.progress() >= 1) wait()
    else s.done(wait)
    return () => { clearTimeout(timer); s.done(null); s.el.removeEventListener('scratched', hold) }
  }, [open, auto, at, go, lang])

  // the guest's own scroll always wins over autoplay
  useEffect(() => {
    if (!open) return
    const stop = (e) => { if (!e.target.closest?.('.bar, .scratch')) setAuto(false) }
    const key = (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' '].includes(e.key) && !e.target.closest?.('button,a')) setAuto(false) }
    const el = scroller.current
    el.addEventListener('wheel', stop, { passive: true })
    el.addEventListener('touchmove', stop, { passive: true })
    window.addEventListener('keydown', key)
    el.focus({ preventScroll: true })
    return () => { el.removeEventListener('wheel', stop); el.removeEventListener('touchmove', stop); window.removeEventListener('keydown', key) }
  }, [open])

  const startSound = () => {
    setStarted(true)
    const a = audio.current
    if (!a || !sound || !song) return
    prevSong.current = song
    fadeIn(a).catch(() => setSound(false))
  }

  useEffect(() => {
    const a = audio.current
    if (!a || !started || !song) return
    const changed = prevSong.current !== song
    prevSong.current = song
    if (changed) a.load()
    if (sound) {
      if (a.paused || changed) fadeIn(a).catch(() => setSound(false))
    } else {
      gsap.killTweensOf(a)
      a.pause()
    }
    const hide = () => {
      if (document.hidden) a.pause()
      else if (sound) {
        try { a.volume = 1 } catch { /* read-only on some mobile browsers */ }
        a.play().catch(() => {})
      }
    }
    document.addEventListener('visibilitychange', hide)
    return () => document.removeEventListener('visibilitychange', hide)
  }, [sound, started, song])

  if (import.meta.env.DEV) window.__inv = { scenes: scenes.current, scroller, go }

  // a tap anywhere finishes the scene's entrance, and a few petals float up from the finger and drift slowly down
  const skip = (e) => {
    if (e.target.closest('a,button,.scratch')) return
    scenes.current[at]?.finish()
    shower(e.clientX, e.clientY, 12)
  }
  const replay = () => { scenes.current.forEach((s) => s.reset()); go(0); setAuto(true) }

  return (
    <>
      <main className="reel" ref={scroller} tabIndex={-1} onClick={skip} inert={open ? undefined : ''}>
        {SCENES.map((s, i) => (
          <Scene key={s.id} scene={s} lang={lang} ref={(r) => { if (r) scenes.current[i] = r }}>
            {words(s.id, c, lang)}
          </Scene>
        ))}
      </main>

      {!gone && (
        <Gate c={c} lang={lang} setLang={setLang} langs={LANGS.map((l) => [l, NATIVE[l]])}
          names={[c.hero.bride, c.hero.and, c.hero.groom]}
          onTap={startSound} onOpen={() => setOpen(true)} onGone={() => setGone(true)} />
      )}

      {open && (
        <nav className="bar">
          <div className="langs small" role="group">
            {LANGS.map((l) => <button key={l} lang={l} aria-pressed={l === lang} onClick={() => setLang(l)}>{NATIVE[l]}</button>)}
          </div>
          {song && <button className="round" aria-label={c.ui.sound} aria-pressed={sound} onClick={() => setSound(!sound)}><i className={sound ? 'i-sound' : 'i-mute'} /></button>}
          <button className="round" aria-label={auto ? c.ui.pause : c.ui.play}
            onClick={() => (at === SCENES.length - 1 && !auto ? replay() : setAuto(!auto))}><i className={auto ? 'i-pause' : 'i-play'} /></button>
        </nav>
      )}
      {song && <audio ref={audio} src={song} loop preload="auto" />}
    </>
  )
}
