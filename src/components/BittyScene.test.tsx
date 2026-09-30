import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { BittyScene } from './BittyScene'
import { shouldAutoplayIntro } from './bittySession'

function mockReducedMotion(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches,
      media: '(prefers-reduced-motion: reduce)',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
}

describe('BittyScene', () => {
  beforeEach(() => {
    sessionStorage.clear()
    mockReducedMotion(false)
    vi.useRealTimers()
  })

  it('autoplays only on the first visit in a session', () => {
    expect(shouldAutoplayIntro(sessionStorage, false)).toBe(true)
    sessionStorage.setItem('bitty-intro-seen-v1', 'true')
    expect(shouldAutoplayIntro(sessionStorage, false)).toBe(false)
  })

  it('completes the first-visit scene and keeps a replay control', () => {
    vi.useFakeTimers()
    const onPhaseChange = vi.fn()
    render(<BittyScene onPhaseChange={onPhaseChange} />)

    act(() => vi.advanceTimersByTime(5100))

    expect(onPhaseChange).toHaveBeenCalledWith('falling')
    expect(onPhaseChange).toHaveBeenCalledWith('approaching')
    expect(onPhaseChange).toHaveBeenCalledWith('lifting')
    expect(onPhaseChange).toHaveBeenCalledWith('done')
    expect(screen.getByRole('button', { name: /repetir la escena/i })).toBeVisible()
  })

  it('still autoplays in React StrictMode during local development', () => {
    vi.useFakeTimers()
    const onPhaseChange = vi.fn()
    render(<StrictMode><BittyScene onPhaseChange={onPhaseChange} /></StrictMode>)

    act(() => vi.advanceTimersByTime(5100))

    expect(onPhaseChange).toHaveBeenCalledWith('falling')
    expect(onPhaseChange).toHaveBeenCalledWith('lifting')
    expect(onPhaseChange).toHaveBeenCalledWith('done')
    expect(sessionStorage.getItem('bitty-intro-seen-v1')).toBe('true')
  })

  it('turns the quick action into the Seeds card with a simple tap/click', async () => {
    sessionStorage.setItem('bitty-intro-seen-v1', 'true')
    render(<BittyScene />)

    await userEvent.click(screen.getByRole('button', { name: /quiero anotar una idea/i }))

    expect(screen.getByText('Bitty encontró esto')).toBeVisible()
    expect(screen.getByRole('link', { name: /visitar app/i })).toHaveAttribute('href', 'https://seed-rouge-eight.vercel.app')
  })

  it('skips motion when reduced motion is preferred and preserves the content', () => {
    mockReducedMotion(true)
    const onPhaseChange = vi.fn()
    render(<BittyScene onPhaseChange={onPhaseChange} />)

    expect(onPhaseChange).toHaveBeenCalledWith('done')
    expect(screen.getByRole('button', { name: /quiero anotar una idea/i })).toBeInTheDocument()
    expect(shouldAutoplayIntro(sessionStorage, true)).toBe(false)
  })
})
