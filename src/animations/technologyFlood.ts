import gsap from 'gsap'

export type TidePhase = 'idle' | 'notice' | 'fill' | 'sweptAway' | 'whaleReturn' | 'landing' | 'drain' | 'settled' | 'done'
// Seconds on a single clock. Overlapping beats provide anticipation, action and
// recovery without timers or a second animation fighting the main timeline.
export const FLOOD_LABELS = { notice: 0, fill: .65, sweptAway: 2.05, whaleReturn: 3.25, landing: 5.1, drain: 5.9 } as const
export const FLOOD_DURATION = 7

export function floodGeometry(section: HTMLElement) {
  const lane = section.querySelector<HTMLElement>('.technology-tide')!
  const grid = section.querySelector<HTMLElement>('.technology-grid')!
  const laneRect = lane.getBoundingClientRect(), gridRect = grid.getBoundingClientRect()
  // Keep the crest just beneath category headings; no empty faucet stage above.
  const height = Math.max(laneRect.height, laneRect.bottom - gridRect.top - 48)
  return { height, surfaceShift: laneRect.height - height }
}

// Single bounded timeline: no timers, infinite tweens, scrub or pinning.
export function createTechnologyFlood(section: HTMLElement, onPhase: (phase: TidePhase) => void) {
  const q = gsap.utils.selector(section)
  const lane = section.querySelector<HTMLElement>('.technology-tide')!
  const width = section.clientWidth
  const mobile = width <= 600, whaleWidth = mobile ? 128 : 216, actorWidth = mobile ? 64 : 88
  const actor = section.querySelector<HTMLElement>('.tide-actor')!
  const actorX = actor.offsetLeft, actorY = actor.offsetTop
  const words = q('.tide-word') as HTMLElement[]
  const { height, surfaceShift } = floodGeometry(section)
  const water = q('.tide-water'), whale = q('.tide-whale')
  const oops = q('.tide-pose-oops')
  const swept = q('.tide-pose-swept'), idle = q('.tide-idle-poses')
  // Clear the CSS fallback's pixel offset before GSAP takes over percentages.
  gsap.set(water, { height, y: 0, yPercent: 115, opacity: 0 })
  gsap.set([oops, swept, whale, q('.tide-caption')].flat(), { opacity: 0 })
  gsap.set([oops, swept, idle, q('.tide-rider')].flat(), { x: 0, y: 0, rotation: 0, scale: 1, transformOrigin: '50% 85%' })
  gsap.set(idle, { opacity: 1 }); gsap.set(actor, { x: 0, y: surfaceShift, rotation: 0, opacity: 1 })
  gsap.set(q('.tide-wave-back'), { x: -28, y: 5 })
  gsap.set(q('.tide-wave-front'), { x: 0, y: 0 })
  gsap.set(q('.tide-wake'), { scaleX: .5, opacity: 0, transformOrigin: 'right center' })
  gsap.set(q('.tide-splash'), { opacity: 0, scale: .25 })
  gsap.set(whale, { x: -whaleWidth, y: surfaceShift }); gsap.set(words, { x: 0, y: 0, rotation: 0 })
  gsap.set(q('.tide-caption'), { y: surfaceShift })
  lane.style.setProperty('--whale-width', `${whaleWidth}px`)
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' }, onComplete: () => onPhase('settled') })
  Object.entries(FLOOD_LABELS).forEach(([label, at]) => tl.addLabel(label, at).call(() => onPhase(label as TidePhase), [], at))
  // Bitty spots the incoming tide, leans forward, then realizes his mistake.
  tl.to(idle, { rotation: -5, y: 3, duration: .3 }, 'notice')
    .to(idle, { rotation: 3, y: 0, duration: .3 }, .3)
    .to(water, { yPercent: 0, opacity: .38, duration: 1.05, ease: 'power2.out' }, 'fill')
    // Two independent surface layers: no background-position repaint per frame.
    .to(q('.tide-wave-back'), { x: 28, y: -3, duration: 5.8, ease: 'none' }, 'fill')
    .to(q('.tide-wave-front'), { x: -38, y: 3, duration: 5.8, ease: 'none' }, 'fill')
    .to(idle, { opacity: 0, duration: .18 }, 1.35)
    .to(oops, { opacity: 1, duration: .18 }, 1.35)
    .to(actor, { x: 8, rotation: 7, duration: .22 }, 1.45)
    .to(actor, { x: 0, rotation: -4, y: surfaceShift - actorWidth * 1.1 - actorY, duration: .32 }, 1.67)
    .to(q('.tide-caption-control'), { opacity: 1, duration: .16 }, 1.65)
    // A moment of resistance, then acceleration in the current's direction.
    .to(oops, { opacity: 0, duration: .18 }, 'sweptAway')
    .to(swept, { opacity: 1, duration: .18 }, 'sweptAway')
    .to(actor, { x: -actorX - (mobile ? 112 : 170) - 60, rotation: -14, duration: .94, ease: 'power2.in' }, 'sweptAway')
    .to(swept, { y: -7, rotation: 3, duration: .23, repeat: 3, yoyo: true, ease: 'sine.inOut' }, 'sweptAway')
    .to(q('.tide-caption-control'), { opacity: 0, duration: .12 }, 2.86)
    .set(actor, { opacity: 0 }, 3)
    .set(whale, { opacity: 1 }, 'whaleReturn')
    .to(q('.tide-caption-transport'), { opacity: 1, duration: .18 }, 3.5)
    // Cruise almost linearly; only the final approach brakes. No stop/start mid-sea.
    .to(whale, { x: width - whaleWidth - 70, duration: 1.5, ease: 'none' }, 'whaleReturn')
    .to(whale, { x: width - whaleWidth - 18, duration: .35, ease: 'power2.out' }, 4.75)
    .to(q('.tide-rider'), { y: mobile ? -3 : -6, rotation: -1.5, duration: .3, repeat: 5, yoyo: true, ease: 'sine.inOut' }, 'whaleReturn')
    .to(q('.tide-wake'), { scaleX: 1.1, opacity: .7, duration: .35 }, 'whaleReturn')
    .to(q('.tide-wake'), { scaleX: .6, opacity: 0, duration: .4 }, 4.8)
    .to(q('.tide-caption-transport'), { opacity: 0, duration: .2 }, 4.8)
    // Existing combined whale sprite dissolves as Bitty makes a short landing hop.
    .set(actor, { x: mobile ? -12 : -24, y: surfaceShift - 22, rotation: -5 }, 'landing')
    .set([oops, swept].flat(), { opacity: 0 }, 'landing')
    .set(idle, { opacity: 1, rotation: 0, y: 0 }, 'landing')
    .to(actor, { opacity: 1, duration: .22 }, 'landing')
    .to(actor, { x: 0, y: surfaceShift, rotation: 0, duration: .38, ease: 'power2.out' }, 'landing')
    .to(whale, { opacity: 0, y: surfaceShift + 14, duration: .3 }, 'landing')
    .to(idle, { rotation: 4, y: 2, duration: .2, repeat: 1, yoyo: true }, 5.5)
    .to(water, { yPercent: 115, opacity: 0, duration: 1.1, ease: 'power2.inOut' }, 'drain')
  q('.tide-splash').forEach((particle: HTMLElement, index: number) => {
    tl.fromTo(particle, { x: 0, y: 0, scale: .4, opacity: .8 }, {
      x: -(16 + index * 12), y: -(12 + index % 2 * 10), scale: .8,
      opacity: 0, duration: .5, ease: 'power2.out', immediateRender: false,
    }, 3.65 + index * .16)
  })
  const sectionRect = section.getBoundingClientRect()
  words.forEach((word, index) => {
    const rect = word.getBoundingClientRect()
    const progress = Math.max(0, Math.min(1, (rect.left - sectionRect.left) / Math.max(width, 1)))
    const direction = index % 2 ? -1 : 1
    // Lower rows are buoyed first; the returning wake reaches each column in turn.
    const depth = Math.max(0, Math.min(1, (rect.top - sectionRect.top) / sectionRect.height || 0))
    tl.to(word, { y: mobile ? -6 : -8 - index % 3 * 2, rotation: direction * 1.6,
      duration: .6, ease: 'sine.inOut' }, 1.05 + (1 - depth) * .45)
    tl.to(word, { x: mobile ? -3 : -6, rotation: -direction * 2, duration: .7, ease: 'sine.inOut' }, 2.05 + (1 - progress) * .2)
    tl.to(word, { x: mobile ? 3 : 6, y: mobile ? -8 : -12, rotation: direction * 3,
      duration: .38, repeat: 1, yoyo: true, ease: 'sine.inOut' }, 3.3 + progress * 1.3)
    tl.to(word, { x: 0, y: 0, rotation: 0, duration: .85, ease: 'power2.out' }, 5.9 + index % 4 * .05)
  })
  return tl
}
