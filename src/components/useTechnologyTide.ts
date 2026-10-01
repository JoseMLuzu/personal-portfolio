import { useEffect, useRef, useState } from 'react'

export type TidePhase = 'idle' | 'rising' | 'floating' | 'crossing' | 'waving' | 'returning' | 'disembarking' | 'draining' | 'settled' | 'done'
export const TIDE_SESSION_KEY = 'bitty-technologies-tide-seen-v3'
export const TIDE_ARRIVED_KEY = 'bitty-technologies-arrived-v3'
export const TIDE_ARRIVED_EVENT = 'bitty-tide-arrived'
const assets = ['/assets/bitty-cyan-foam-water.png', '/assets/bitty-whale-wave.png', '/assets/bitty-whale-ride.png']

export function useTechnologyTide() {
  const sectionRef = useRef<HTMLElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<TidePhase>('idle')

  useEffect(() => {
    const section = sectionRef.current
    const scene = sceneRef.current
    if (!section || !scene) return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    let disposed = false
    let started = false
    let assetsReady = false
    let sectionVisible = false
    let tideVisible = false
    const timers: number[] = []
    let observer: IntersectionObserver | null = null
    const clear = () => { timers.forEach(window.clearTimeout); timers.length = 0 }
    const finish = () => { clear(); observer?.disconnect(); if (!disposed) setPhase('done') }

    const start = () => {
      if (disposed || started || !assetsReady || !sectionVisible || !tideVisible || media.matches) return
      started = true
      sessionStorage.setItem(TIDE_SESSION_KEY, 'true')
      observer?.disconnect()
      const bounds = section.getBoundingClientRect()
      const water = scene.getBoundingClientRect()
      const grid = section.querySelector<HTMLElement>('.technology-grid')?.getBoundingClientRect()
      // Raise the crest to the category headings, not just the bottom third.
      if (grid) scene.style.height = `${bounds.bottom - grid.top + 100}px`
      const whaleWidth = parseFloat(getComputedStyle(scene).getPropertyValue('--whale-width'))
      // Stop inside the right edge instead of disappearing off-screen.
      section.style.setProperty('--whale-travel', `${bounds.width - 20}px`)
      section.style.setProperty('--whale-left-stop', `${whaleWidth + 20}px`)
      // Compute each whole word's delay from its horizontal position, not DOM order.
      section.querySelectorAll<HTMLElement>('.technology-name').forEach((word, index) => {
        const rect = word.getBoundingClientRect()
        if (rect.bottom < (grid?.top ?? water.top) - 90) return
        const progress = (rect.left + rect.width / 2 - bounds.left + whaleWidth / 2) / (bounds.width + whaleWidth)
        word.dataset.tideReact = 'true'
        word.style.setProperty('--tide-delay', `${Math.max(0, Math.min(1, progress)) * 2500}ms`)
        word.style.setProperty('--tide-lift-delay', `${(index % 3) * 70}ms`)
        word.style.setProperty('--tide-rise', `${word.textContent === 'Docker' ? -12 : -8 - (index % 3) * 2}px`)
        word.style.setProperty('--tide-tilt', `${word.textContent === 'Docker' ? 3 : (index % 2 ? -2 : 2)}deg`)
        word.style.setProperty('--tide-drift', `${4 + (index % 3) * 2}px`)
        word.style.setProperty('--tide-rest-tilt', `${index % 2 ? -1.5 : 2}deg`)
      })
      setPhase('rising')
      ;([[1400, 'floating'], [2300, 'crossing'], [4700, 'waving'], [5100, 'returning'], [7500, 'disembarking'], [8300, 'draining'], [9700, 'settled']] as const).forEach(([delay, next]) => {
        timers.push(window.setTimeout(() => {
          setPhase(next)
          if (next === 'draining') {
            sessionStorage.setItem(TIDE_ARRIVED_KEY, 'true')
            window.dispatchEvent(new Event(TIDE_ARRIVED_EVENT))
          }
        }, delay))
      })
    }

    const preference = () => {
      if (media.matches) { started = true; finish() }
    }
    // Don't leave a half-played scene when the page is backgrounded or resized.
    const interrupt = () => { if (started) finish() }
    const visibility = () => { if (document.hidden) interrupt() }
    media.addEventListener('change', preference)
    window.addEventListener('resize', interrupt)
    document.addEventListener('visibilitychange', visibility)

    if (media.matches || sessionStorage.getItem(TIDE_SESSION_KEY) === 'true' || typeof IntersectionObserver !== 'function') {
      setPhase('done')
      return () => {
        disposed = true
        media.removeEventListener('change', preference)
        window.removeEventListener('resize', interrupt)
        document.removeEventListener('visibilitychange', visibility)
      }
    }

    observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.target === section) sectionVisible = entry.isIntersecting && entry.intersectionRatio >= .35
        if (entry.target === scene) tideVisible = entry.isIntersecting && entry.intersectionRatio >= .15
      }
      start()
    }, { threshold: [0, .15, .35] })
    // On tall mobile layouts, wait until the lower animation lane is also visible.
    observer.observe(section)
    observer.observe(scene)
    const images = assets.map(src => {
      const image = new Image()
      image.src = src
      return image
    })
    Promise.all(images.map(image => new Promise<boolean>(resolve => {
      if (image.complete) { resolve(image.naturalWidth > 0); return }
      image.onload = () => resolve(true)
      image.onerror = () => resolve(false)
    }))).then(loaded => {
      if (disposed) return
      if (!loaded.every(Boolean)) { finish(); return }
      assetsReady = true
      start()
    })
    return () => {
      disposed = true
      clear()
      observer?.disconnect()
      images.forEach(image => { image.onload = null; image.onerror = null })
      media.removeEventListener('change', preference)
      window.removeEventListener('resize', interrupt)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [])

  return { sectionRef, sceneRef, phase }
}
