import { act, render, screen, within } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Technologies } from './Technologies'
import { TIDE_ARRIVED_EVENT, TIDE_ARRIVED_KEY, TIDE_SESSION_KEY } from './useTechnologyTide'

let observerCallback: IntersectionObserverCallback
let observer: { observe: ReturnType<typeof vi.fn>; disconnect: ReturnType<typeof vi.fn> }
let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }
let assetWorks = true
beforeEach(() => {
  sessionStorage.clear()
  assetWorks = true
  vi.useFakeTimers()
  media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', () => media)
  vi.stubGlobal('Image', class {
    src = ''; complete = true; naturalWidth = assetWorks ? 100 : 0
    onload = null; onerror = null
  })
  vi.stubGlobal('IntersectionObserver', class {
    observe = vi.fn(); disconnect = vi.fn()
    constructor(callback: IntersectionObserverCallback) { observerCallback = callback; observer = this }
  })
})
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals() })

async function intersect(container: HTMLElement, ratio = .5, lane = true) {
  const section = container.querySelector<HTMLElement>('.technologies')!
  const scene = container.querySelector<HTMLElement>('.technology-tide')!
  section.getBoundingClientRect = () => ({ left: 0, width: 1200, bottom: 900 } as DOMRect)
  scene.getBoundingClientRect = () => ({ top: 600 } as DOMRect)
  scene.style.setProperty('--whale-width', '240px')
  container.querySelectorAll<HTMLElement>('.technology-name').forEach((word, index) => {
    word.getBoundingClientRect = () => ({ left: index * 70, width: 80, bottom: 750 } as DOMRect)
  })
  await act(async () => {
    observerCallback([
      { target: section, isIntersecting: ratio > 0, intersectionRatio: ratio },
      { target: scene, isIntersecting: lane, intersectionRatio: lane ? .5 : 0 },
    ] as unknown as IntersectionObserverEntry[], observer as unknown as IntersectionObserver)
    await Promise.resolve()
  })
  return section
}

describe('technology content', () => {
  it('groups technologies and distinguishes experience from the portfolio stack', () => {
    render(<Technologies />)
    const section = screen.getByRole('region', { name: /con qué construyo/i })
    expect(section).toHaveAttribute('id', 'tecnologias')
    expect(within(section).getAllByRole('article')).toHaveLength(5)
    const languages = within(screen.getByRole('article', { name: 'Lenguajes' }))
    expect(languages.getByText('Python').closest('li')).toHaveTextContent('Experiencia')
    expect(languages.getByText('TypeScript').closest('li')).toHaveTextContent('Este portafolio')
    expect(screen.getByText('Motores y proyectos por documentar.')).toBeVisible()
    expect(screen.queryByText(/PostgreSQL|MySQL|MongoDB/)).not.toBeInTheDocument()
    expect(within(section).getAllByRole('listitem')).toHaveLength(13)
    expect(section.querySelector('.technology-tide')).toHaveAttribute('aria-hidden', 'true')
    expect(within(section).queryByRole('img')).not.toBeInTheDocument()
  })

  it('raises words before crossing, parks Bitty and leaves drifted words after draining once', async () => {
    const { container, unmount } = render(<StrictMode><Technologies /></StrictMode>)
    const section = await intersect(container, .1)
    expect(section).toHaveAttribute('data-tide-phase', 'idle')
    await intersect(container, .5, false)
    expect(section).toHaveAttribute('data-tide-phase', 'idle')
    await intersect(container)
    expect(section).toHaveAttribute('data-tide-phase', 'rising')
    expect(sessionStorage.getItem(TIDE_SESSION_KEY)).toBe('true')
    const words = Array.from(container.querySelectorAll<HTMLElement>('.technology-name'))
    const arrived = vi.fn()
    window.addEventListener(TIDE_ARRIVED_EVENT, arrived)
    expect(words[0].style.getPropertyValue('--tide-delay')).not.toBe(words[3].style.getPropertyValue('--tide-delay'))
    expect(words[0].textContent).toBe('Python')
    expect(section.style.getPropertyValue('--whale-travel')).toBe('1180px')
    expect(words[0].style.getPropertyValue('--tide-drift')).toBe('4px')
    expect(words[0].style.getPropertyValue('--tide-rest-tilt')).toBe('2deg')
    act(() => vi.advanceTimersByTime(1400))
    expect(section).toHaveAttribute('data-tide-phase', 'floating')
    act(() => vi.advanceTimersByTime(900))
    expect(section).toHaveAttribute('data-tide-phase', 'crossing')
    act(() => vi.advanceTimersByTime(2400))
    expect(section).toHaveAttribute('data-tide-phase', 'waving')
    act(() => vi.advanceTimersByTime(400))
    expect(section).toHaveAttribute('data-tide-phase', 'returning')
    act(() => vi.advanceTimersByTime(2400))
    expect(section).toHaveAttribute('data-tide-phase', 'disembarking')
    act(() => vi.advanceTimersByTime(800))
    expect(section).toHaveAttribute('data-tide-phase', 'draining')
    expect(arrived).toHaveBeenCalledOnce()
    expect(sessionStorage.getItem(TIDE_ARRIVED_KEY)).toBe('true')
    window.removeEventListener(TIDE_ARRIVED_EVENT, arrived)
    act(() => vi.advanceTimersByTime(1400))
    expect(section).toHaveAttribute('data-tide-phase', 'settled')
    await intersect(container)
    expect(section).toHaveAttribute('data-tide-phase', 'settled')
    unmount()
    const again = render(<Technologies />)
    expect(again.container.querySelector('.technologies')).toHaveAttribute('data-tide-phase', 'done')
  })

  it('shows a static section with reduced motion and finishes on preference change', async () => {
    media.matches = true
    const first = render(<Technologies />)
    expect(first.container.querySelector('.technologies')).toHaveAttribute('data-tide-phase', 'done')
    first.unmount()
    media.matches = false
    const second = render(<Technologies />)
    const section = await intersect(second.container)
    media.matches = true
    act(() => media.addEventListener.mock.calls.at(-1)![1]())
    expect(section).toHaveAttribute('data-tide-phase', 'done')
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cleans observers, timers and media listeners on unmount', async () => {
    const { container, unmount } = render(<Technologies />)
    await intersect(container)
    expect(vi.getTimerCount()).toBe(7)
    unmount()
    expect(vi.getTimerCount()).toBe(0)
    expect(observer.disconnect).toHaveBeenCalled()
    expect(media.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
  })

  it('keeps all content available if a sprite fails', async () => {
    assetWorks = false
    const { container } = render(<Technologies />)
    await act(async () => { await Promise.resolve() })
    expect(container.querySelector('.technologies')).toHaveAttribute('data-tide-phase', 'done')
    expect(screen.getAllByRole('listitem')).toHaveLength(13)
  })
})
