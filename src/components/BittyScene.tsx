import { useCallback, useEffect, useRef, useState } from 'react'
import { BITTY_SESSION_KEY, shouldAutoplayIntro } from './bittySession'
import { useBittyGuide } from './BittyGuide'
import './Hero.css'

export type HeroPhase = 'ready' | 'tipping' | 'fallen' | 'entering' | 'noticing' | 'fetching' | 'closing' | 'repair-one' | 'repair-two' | 'opening' | 'crooked' | 'straightening' | 'done'
const timeline: [number, HeroPhase][] = [
  [150, 'tipping'], [1000, 'fallen'], [1650, 'entering'], [2250, 'noticing'],
  [3500, 'fetching'], [4400, 'closing'], [5150, 'repair-one'], [5750, 'repair-two'],
  [6450, 'opening'], [7200, 'crooked'], [7900, 'straightening'], [8700, 'done'],
]

export function BittyScene({ onPhaseChange }: { onPhaseChange?: (phase: HeroPhase) => void }) {
  const [phase, setPhase] = useState<HeroPhase>('ready')
  const rootRef = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<HeroPhase>('ready')
  const callbackRef = useRef(onPhaseChange)
  callbackRef.current = onPhaseChange
  const timers = useRef<number[]>([])
  const guide = useBittyGuide()
  const hidden = Boolean(guide?.hidden)

  const clear = useCallback(() => {
    timers.current.forEach(window.clearTimeout)
    timers.current = []
  }, [])
  const change = useCallback((next: HeroPhase) => {
    phaseRef.current = next
    setPhase(next)
    callbackRef.current?.(next)
    if (next === 'done') sessionStorage.setItem(BITTY_SESSION_KEY, 'true')
  }, [])
  const finish = useCallback(() => {
    clear()
    if (phaseRef.current !== 'done') change('done')
  }, [change, clear])
  const play = useCallback(() => {
    clear()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced || hidden) { change('done'); return }
    change('ready')
    timeline.forEach(([delay, next]) => {
      timers.current.push(window.setTimeout(() => change(next), delay))
    })
  }, [change, clear, hidden])

  useEffect(() => {
    const root = rootRef.current
    const letters = root?.querySelector('.hero-letter-zone')
    if (!root || !letters) return
    // Use viewport coordinates: the curtain is fixed, not sized to the name.
    const measure = () => {
      const bounds = letters.getBoundingClientRect()
      const em = parseFloat(getComputedStyle(letters).fontSize)
      const mobile = window.innerWidth <= 600
      root.style.setProperty('--hero-curtain-left', `${Math.max(0, bounds.left)}px`)
      root.style.setProperty('--hero-corner-x', `${Math.max(0, window.innerWidth - 16 - bounds.right - (mobile ? 1.15 : 1.45) * em)}px`)
      // Move the actor's right edge to the same edge as the curtain's left side.
      root.style.setProperty('--hero-pull-x', `${bounds.left - bounds.right - (mobile ? 1.15 : 1.45) * em}px`)
    }
    measure()
    const observer = 'ResizeObserver' in window ? new ResizeObserver(measure) : null
    observer?.observe(root)
    window.addEventListener('resize', measure)
    return () => {
      observer?.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!hidden && window.scrollY === 0 && shouldAutoplayIntro(sessionStorage, media.matches)) play()
    else change('done')

    // Capturing interaction completes the scene without cancelling that event.
    const interrupt = (event: Event) => {
      if (event.target instanceof Element && event.target.closest('[data-hero-replay]') &&
          (event.type === 'pointerdown' || (event instanceof KeyboardEvent && ['Enter', ' '].includes(event.key)))) return
      finish()
    }
    const onPreference = () => { if (media.matches) finish() }
    const onVisibility = () => { if (document.hidden) finish() }
    window.addEventListener('pointerdown', interrupt, { capture: true, passive: true })
    window.addEventListener('keydown', interrupt, true)
    window.addEventListener('scroll', finish, { passive: true })
    window.addEventListener('wheel', finish, { passive: true })
    window.addEventListener('touchstart', interrupt, { capture: true, passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    media.addEventListener('change', onPreference)
    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) finish()
    }) : null
    const hero = rootRef.current?.closest('.hero')
    if (hero) observer?.observe(hero)
    return () => {
      clear()
      observer?.disconnect()
      window.removeEventListener('pointerdown', interrupt, true)
      window.removeEventListener('keydown', interrupt, true)
      window.removeEventListener('scroll', finish)
      window.removeEventListener('wheel', finish)
      window.removeEventListener('touchstart', interrupt, true)
      document.removeEventListener('visibilitychange', onVisibility)
      media.removeEventListener('change', onPreference)
    }
  }, [change, clear, finish, hidden, play])

  return <div ref={rootRef} className={`hero-name-scene phase-${phase}`} data-phase={phase}>
    <h1 aria-label="José Manuel Luzuriaga">
      <span className="hero-first-name" aria-hidden="true">José Manuel</span>
      <span className="hero-surname" aria-hidden="true">Luzur<span className="hero-letter-zone">
        <span className="hero-loose-letter hero-letter-i">i</span><span className="hero-loose-letter hero-letter-first-a">a</span>
        <span className="hero-loose-letter hero-letter-g">g</span><span className="hero-loose-letter hero-letter-a">a</span>
        <span className="hero-curtains"><span className="hero-curtain" /></span>
        <span className="hero-actor"><span className="hero-bitty-sprite" /><span className="hero-bitty-speech">It was like that when I got here.</span></span>
      </span></span>
    </h1>
    <button className="hero-replay" type="button" data-hero-replay onClick={play} aria-label="Replay Bitty’s scene">↻ Replay scene</button>
  </div>
}
