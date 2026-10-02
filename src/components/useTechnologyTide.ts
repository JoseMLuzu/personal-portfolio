import { useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { createTechnologyFlood, floodGeometry, type TidePhase } from '../animations/technologyFlood'

gsap.registerPlugin(useGSAP)
export const TIDE_ARRIVED_KEY = 'bitty-technologies-arrived-v6'
export const TIDE_ARRIVED_EVENT = 'bitty-tide-arrived'
export const TIDE_STARTED_EVENT = 'bitty-tide-started'
const assets = ['bitty-swept-left.png', 'bitty-tap-oops.png',
  'bitty-cobalt-sea.png', 'bitty-whale-wave.png', 'bitty-stand.png']

export function useTechnologyTide() {
  const sectionRef = useRef<HTMLElement>(null)
  const startRef = useRef<() => void>(() => {})
  const finishRef = useRef<() => void>(() => {})
  const [phase, setPhase] = useState<TidePhase>('idle')
  const [hasPlayed, setHasPlayed] = useState(false)
  const [ready, setReady] = useState(false)
  const [assetError, setAssetError] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useGSAP((_context, contextSafe) => {
    const section = sectionRef.current
    if (!section) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let active = true, playing = false, loaded = false
    let timeline: gsap.core.Timeline | undefined
    const images: HTMLImageElement[] = []
    const position = () => {
      const { surfaceShift } = floodGeometry(section)
      gsap.set(section.querySelectorAll('.tide-actor'), { y: surfaceShift })
    }
    position()
    const restoreFocus = () => {
      if (document.activeElement?.classList.contains('technology-skip')) {
        section.querySelector<HTMLButtonElement>('.technology-start')?.focus({ preventScroll: true })
      }
    }
    const finish = () => {
      if (!active || !playing) return
      playing = false
      timeline?.progress(1, true).pause()
      restoreFocus()
      setPhase('settled')
    }
    finishRef.current = finish
    startRef.current = contextSafe!(() => {
      if (!active || playing || !loaded) return
      setHasPlayed(true)
      sessionStorage.removeItem(TIDE_ARRIVED_KEY)
      window.dispatchEvent(new Event(TIDE_STARTED_EVENT))
      if (media.matches) { setPhase('settled'); return }
      playing = true
      // Fresh measurements for every user-triggered run, including after resize.
      timeline?.kill()
      timeline = createTechnologyFlood(section, next => {
        if (!active) return
        if (next === 'settled') { playing = false; restoreFocus() }
        setPhase(next)
      })
      setPhase('notice')
      timeline.play(0)
    })
    const preference = () => { setReducedMotion(media.matches); if (media.matches) finish() }
    const resize = contextSafe!(() => { finish(); position() })
    const visibility = () => { if (document.hidden) finish() }
    const leaveSection = () => {
      if (!playing) return
      const rect = section.getBoundingClientRect()
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) finish()
    }
    media.addEventListener('change', preference)
    window.addEventListener('resize', resize)
    document.addEventListener('visibilitychange', visibility)
    window.addEventListener('scroll', leaveSection, { passive: true })
    Promise.all(assets.map(file => new Promise<boolean>(resolve => {
      const image = new Image(); images.push(image)
      image.onload = () => resolve(true); image.onerror = () => resolve(false)
      image.src = `/assets/${file}`
      if (image.complete) resolve(image.naturalWidth > 0)
    }))).then(results => {
      if (!active) return
      loaded = results.every(Boolean)
      setReady(loaded); setAssetError(!loaded)
    })
    return () => {
      active = false
      startRef.current = () => {}; finishRef.current = () => {}
      timeline?.kill()
      images.forEach(image => { image.onload = null; image.onerror = null })
      media.removeEventListener('change', preference)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', visibility)
      window.removeEventListener('scroll', leaveSection)
    }
  }, { scope: sectionRef })
  const playing = !['idle', 'done', 'settled'].includes(phase)
  return { sectionRef, phase, playing, hasPlayed, ready, assetError, reducedMotion,
    start: () => startRef.current(), skip: () => finishRef.current() }
}
