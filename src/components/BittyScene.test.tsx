import { act, fireEvent, render, screen } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BittyScene } from './BittyScene'
import { Hero } from './Hero'
import { BITTY_SESSION_KEY, shouldAutoplayIntro } from './bittySession'

let reduced = false
beforeEach(() => {
  sessionStorage.clear()
  reduced = false
  vi.useFakeTimers()
  Object.defineProperty(window, 'matchMedia', { writable: true, value: vi.fn(() => ({
    matches: reduced, addEventListener: vi.fn(), removeEventListener: vi.fn(),
  })) })
})
afterEach(() => vi.useRealTimers())

describe('hero curtain scene', () => {
  it('anchors one curtain to the affected letters and recalculates on resize', () => {
    const { container, unmount } = render(<Hero />)
    const letters = container.querySelector('.hero-letter-zone')!
    const scene = container.querySelector<HTMLElement>('.hero-name-scene')!
    const rect = vi.spyOn(letters, 'getBoundingClientRect').mockReturnValue({ left: 240 } as DOMRect)
    fireEvent(window, new Event('resize'))
    expect(scene.style.getPropertyValue('--hero-curtain-left')).toBe('240px')
    expect(container.querySelectorAll('.hero-curtain')).toHaveLength(1)
    rect.mockReturnValue({ left: 180 } as DOMRect)
    fireEvent(window, new Event('resize'))
    expect(scene.style.getPropertyValue('--hero-curtain-left')).toBe('180px')
    unmount()
    rect.mockClear()
    fireEvent(window, new Event('resize'))
    expect(rect).not.toHaveBeenCalled()
    rect.mockRestore()
  })

  it('keeps an accessible name and the project link available from the first frame', () => {
    const { container } = render(<Hero />)
    expect(screen.getByRole('heading', { name: 'José Manuel Luzuriaga' })).toBeVisible()
    expect(screen.getByRole('link', { name: /ver proyectos/i })).toHaveAttribute('href', '#proyectos')
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'ready')
    expect(container.querySelector('.hero-surname')).toHaveAttribute('aria-hidden', 'true')
    expect(Array.from(container.querySelectorAll('.hero-loose-letter')).map(letter => letter.textContent).join('')).toBe('iaga')
  })

  it('fetches the curtain, repairs behind it, reveals crooked letters and finishes in 8.7 seconds under StrictMode', () => {
    const onPhaseChange = vi.fn()
    const { container } = render(<StrictMode><BittyScene onPhaseChange={onPhaseChange} /></StrictMode>)
    act(() => vi.advanceTimersByTime(1000))
    expect(onPhaseChange).toHaveBeenLastCalledWith('fallen')
    act(() => vi.advanceTimersByTime(1250))
    expect(onPhaseChange).toHaveBeenLastCalledWith('noticing')
    expect(screen.getByText('Estaba así cuando llegué.')).toBeInTheDocument()
    act(() => vi.advanceTimersByTime(1250))
    expect(onPhaseChange).toHaveBeenLastCalledWith('fetching')
    act(() => vi.advanceTimersByTime(2250))
    expect(onPhaseChange).toHaveBeenLastCalledWith('repair-two')
    act(() => vi.advanceTimersByTime(700))
    expect(onPhaseChange).toHaveBeenLastCalledWith('opening')
    act(() => vi.advanceTimersByTime(750))
    expect(onPhaseChange).toHaveBeenLastCalledWith('crooked')
    act(() => vi.advanceTimersByTime(1500))
    expect(onPhaseChange).toHaveBeenCalledWith('closing')
    expect(onPhaseChange).toHaveBeenCalledWith('repair-one')
    expect(onPhaseChange).toHaveBeenCalledWith('repair-two')
    expect(onPhaseChange).toHaveBeenCalledWith('straightening')
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
    expect(sessionStorage.getItem(BITTY_SESSION_KEY)).toBe('true')
  })

  it('does not autoplay on return but allows intentional replay', () => {
    sessionStorage.setItem(BITTY_SESSION_KEY, 'true')
    const { container } = render(<BittyScene />)
    expect(shouldAutoplayIntro(sessionStorage, false)).toBe(false)
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
    fireEvent.pointerDown(screen.getByRole('button', { name: /repetir la escena/i }))
    fireEvent.click(screen.getByRole('button', { name: /repetir la escena/i }))
    act(() => vi.advanceTimersByTime(150))
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'tipping')
  })

  it.each(['pointerdown', 'keydown', 'scroll', 'wheel', 'touchstart'])('finishes immediately on %s and cancels pending phases', (type) => {
    const { container } = render(<Hero />)
    act(() => vi.advanceTimersByTime(500))
    fireEvent(window, new Event(type, { bubbles: true }))
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
    act(() => vi.advanceTimersByTime(10000))
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
  })

  it('interrupts Tab from the replay control, without suppressing its keyboard activation', () => {
    const { container } = render(<Hero />)
    const replay = screen.getByRole('button', { name: /repetir la escena/i })
    fireEvent.click(replay)
    fireEvent.keyDown(replay, { key: 'Tab' })
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
    fireEvent.keyDown(replay, { key: 'Enter' })
    fireEvent.click(replay)
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'ready')
  })

  it('skips curtains and falling letters with reduced motion', () => {
    reduced = true
    const { container } = render(<Hero />)
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
    fireEvent.click(screen.getByRole('button', { name: /repetir la escena/i }))
    expect(container.querySelector('.hero-name-scene')).toHaveAttribute('data-phase', 'done')
  })

  it('cleans up timers and callbacks on unmount', () => {
    const onPhaseChange = vi.fn()
    const { unmount } = render(<BittyScene onPhaseChange={onPhaseChange} />)
    unmount()
    onPhaseChange.mockClear()
    act(() => vi.advanceTimersByTime(10000))
    expect(onPhaseChange).not.toHaveBeenCalled()
  })
})
