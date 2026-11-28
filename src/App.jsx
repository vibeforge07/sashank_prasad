import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { shower } from './components/petals.js'
import Scene from './components/Scene.jsx'
import Gate from './components/Gate.jsx'
import { Events, Timeline, FRAMED } from './components/Schedule.jsx'
import { Hero, Family, DatePage, EventWords, Closing } from './components/Words.jsx'
import { SCENES } from './scenes/scenes.js'
import en from './content/en.js'
import hi from './content/hi.js'
import bn from './content/bn.js'

const TEXT = { en, hi, bn }
// the three ceremonies at home live inside the schedule's arched frames instead of on screens of their own
const REEL = SCENES.filter((s) => !FRAMED.includes(s.id))
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
  // the cover is the first page of the scroll, so the invitation is open from the start
  const open = true
  const [started, setStarted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [sound, setSound] = useState(true)
  const [at, setAt] = useState(0)
  const [onCover, setOnCover] = useState(true)
  const scroller = useRef(null)
  const scenes = useRef([])
  const audio = useRef(null)
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

  // while the cover fills the screen, the scroll word wears the cover's maroon instead of white
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setOnCover(e.isIntersecting), { root: scroller.current, threshold: 0.55 })
    io.observe(document.getElementById('cover'))
    return () => io.disconnect()
  }, [])

  // nothing moves on by itself: the guest scrolls through every page; the keys scroll it too
  useEffect(() => {
    if (open) scroller.current.focus({ preventScroll: true })
  }, [open])

  // The song starts when the guest starts scrolling, not on a tap. A phone allows it as the finger lifts at the
  // end of the first swipe (on the cover the swipe turns the page instead of scrolling it, so it counts).
  // Scroll keys count everywhere. A mouse wheel starts it only where the browser allows that; where it does not,
  // the first click after the guest has begun scrolling starts it. A refusal never turns the sound off.
  const trying = useRef(false)
  const scrolled = useRef(false)
  useEffect(() => {
    if (started) return
    const tryPlay = () => {
      const a = audio.current
      if (!a || !sound || !song) { setStarted(true); return }
      if (trying.current) return
      trying.current = true
      prevSong.current = song
      fadeIn(a).then(() => setStarted(true), () => {}).finally(() => { trying.current = false })
    }
    const go = () => { scrolled.current = true; tryPlay() }
    let y0 = null
    const onTouchStart = (e) => { y0 = e.touches[0]?.clientY ?? null }
    const onTouchEnd = (e) => {
      const y = e.changedTouches[0]?.clientY
      if (y0 != null && y != null && Math.abs(y - y0) > 10) go()
      else if (scrolled.current) tryPlay()
    }
    const onKey = (e) => { if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', ' ', 'End', 'Home'].includes(e.key)) go() }
    const onDown = (e) => { if (e.pointerType === 'mouse' && scrolled.current) tryPlay() }
    const onScroll = () => { scrolled.current = true }
    const sc = scroller.current
    const on = [['touchstart', onTouchStart], ['touchend', onTouchEnd], ['wheel', go], ['keydown', onKey], ['pointerdown', onDown]]
    on.forEach(([ev, f]) => window.addEventListener(ev, f, { passive: true }))
    sc?.addEventListener('scroll', onScroll, { passive: true })
    return () => { on.forEach(([ev, f]) => window.removeEventListener(ev, f)); sc?.removeEventListener('scroll', onScroll) }
  }) // eslint-disable-line react-hooks/exhaustive-deps

  // the sound button dances only while the song is really playing
  useEffect(() => {
    const a = audio.current
    if (!a) return
    const on = () => setPlaying(true)
    const off = () => setPlaying(false)
    a.addEventListener('playing', on)
    a.addEventListener('pause', off)
    a.addEventListener('ended', off)
    return () => { a.removeEventListener('playing', on); a.removeEventListener('pause', off); a.removeEventListener('ended', off) }
  }, [song])

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

  if (import.meta.env.DEV) window.__inv = { scenes: scenes.current, scroller }

  // a tap anywhere finishes the scene's entrance, and a few petals float up from the finger and drift slowly down
  const skip = (e) => {
    if (e.target.closest('a,button,.scratch')) return
    scenes.current[at]?.finish()
    shower(e.clientX, e.clientY, 12)
  }

  return (
    <>
      <main className="reel" ref={scroller} tabIndex={-1} onClick={skip}>
        <Gate c={c} lang={lang} setLang={setLang} langs={LANGS.map((l) => [l, NATIVE[l]])}
          names={[c.hero.bride, c.hero.and, c.hero.groom]} />
        {REEL.map((s, i) => [
          <Scene key={s.id} scene={s} lang={lang} ref={(r) => { if (r) scenes.current[i] = r }}>
            {words(s.id, c, lang)}
          </Scene>,
          s.id === 'date' && [<Events key="events" c={c} lang={lang} />, <Timeline key="timeline" c={c} lang={lang} />],
        ])}
      </main>

      {open && (
        <nav className="bar">
          <div className="langs small" role="group">
            {LANGS.map((l) => <button key={l} lang={l} aria-pressed={l === lang} onClick={() => setLang(l)}>{NATIVE[l]}</button>)}
          </div>
          {song && <button className={`round snd${playing ? ' on' : ''}`} aria-label={c.ui.sound} aria-pressed={sound && playing}
            onClick={() => (sound && !playing ? startSound() : setSound(!sound))}><i className="eq"><b /><b /><b /><b /></i></button>}
        </nav>
      )}
      {/* a faint word at the foot of every page, so the guest knows there is more below; gone on the last page */}
      {open && (
        <div className={`scroll-mark${at === REEL.length - 1 ? ' off' : ''}${onCover ? ' on-cover' : ''}`} lang={lang} aria-hidden="true">
          <span>{c.hero.scroll}</span><i />
        </div>
      )}
      {song && <audio ref={audio} src={song} loop preload="auto" />}
    </>
  )
}
