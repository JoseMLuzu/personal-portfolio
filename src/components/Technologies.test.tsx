import { act, fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { StrictMode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import * as flood from '../animations/technologyFlood'
import { Technologies } from './Technologies'

let media: { matches: boolean; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> }
let assetWorks = true
beforeEach(() => {
  sessionStorage.clear(); assetWorks = true
  media = { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', () => media)
  vi.stubGlobal('Image', class { src = ''; complete = true; naturalWidth = assetWorks ? 100 : 0; onload = null; onerror = null })
  vi.spyOn(flood, 'createTechnologyFlood')
})
afterEach(() => { vi.restoreAllMocks(); vi.unstubAllGlobals() })
async function ready() { await act(async () => { await Promise.resolve() }) }
function timeline() { return vi.mocked(flood.createTechnologyFlood).mock.results.at(-1)!.value as ReturnType<typeof flood.createTechnologyFlood> }
function start() { fireEvent.click(document.querySelector('.technology-start')!) }
function pose() { return document.querySelector('.tide-idle-poses')?.getAttribute('data-pose') }

describe('optional stack flood', () => {
  it('shows only skill names while keeping accessible descriptions and Bitty reactions', async () => {
    render(<Technologies />); await ready()
    const section = screen.getByRole('region', { name: /tools i build with/i })
    expect(within(section).getAllByRole('article')).toHaveLength(4)
    expect(within(section).getAllByRole('listitem')).toHaveLength(13)
    expect(section.querySelectorAll('.technology-grid p')).toHaveLength(0)
    expect(screen.getByRole('button', { name: 'Python' })).toHaveAccessibleDescription('Bitty’s backend is written in Python.')
    expect(screen.getByRole('button', { name: 'Python' }).closest('li')).toHaveTextContent('Experience')
    expect(screen.getByRole('button', { name: 'Docker' }).closest('li')).toHaveTextContent('Experience')
    for (const name of ['JavaScript', 'TypeScript', 'Python', 'React', 'Flask', 'PostgreSQL', 'Supabase', 'Git', 'GitHub', 'Docker', 'Swift', 'Capacitor', 'WordPress']) {
      expect(screen.getByRole('button', { name })).toBeVisible()
    }
    expect(screen.queryByRole('button', { name: /Docker · scene reference/ })).not.toBeInTheDocument()
    expect(section.querySelector('.technology-feedback')).not.toBeInTheDocument()
    expect(screen.queryByText(/Experience en React, Python y bases de datos/)).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /View/ })).toHaveAttribute('href', 'https://github.com/JoseMLuzu/personal-portfolio')
    expect(within(section).queryByRole('img')).not.toBeInTheDocument()
    expect(pose()).toBe('normal')
  })
  it('keeps the beach static in Strict Mode until the wave is requested', async () => {
    const view = render(<StrictMode><Technologies /></StrictMode>); await ready()
    fireEvent.scroll(window)
    expect(view.container.querySelector('.tide-tap')).not.toBeInTheDocument()
    expect(view.container.querySelector('.tide-stream')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Watch the wave/ })).toBeEnabled()
    expect(flood.createTechnologyFlood).not.toHaveBeenCalled()
    expect(view.container.querySelector('section')).toHaveAttribute('data-tide-phase', 'idle')
    start(); expect(flood.createTechnologyFlood).toHaveBeenCalledOnce()
    view.unmount(); expect(media.removeEventListener).toHaveBeenCalled()
  })
  it('changes available poses with pointer, touch clicks and keyboard focus', async () => {
    const user = userEvent.setup()
    render(<Technologies />); await ready()
    fireEvent.pointerOver(screen.getByRole('button', { name: 'React' }))
    expect(pose()).toBe('wink')
    expect(screen.getByRole('status')).toHaveTextContent('Separates the hero')
    fireEvent.pointerOut(screen.getByRole('button', { name: 'React' }))
    expect(pose()).toBe('normal')
    await user.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(pose()).toBe('cat')
    act(() => screen.getByRole('button', { name: 'Docker' }).focus())
    expect(pose()).toBe('whale')
    await user.keyboard('{Escape}')
    expect(pose()).toBe('normal')
    await user.click(screen.getByRole('button', { name: 'Docker' }))
    expect(pose()).toBe('whale')
    expect(flood.createTechnologyFlood).not.toHaveBeenCalled()
  })
  it('runs a seven-second labelled story only on activation and pauses hovers', async () => {
    const view = render(<Technologies />); await ready(); start()
    expect(timeline().labels).toEqual(flood.FLOOD_LABELS)
    expect(timeline().duration()).toBeCloseTo(flood.FLOOD_DURATION)
    expect(screen.getByRole('button', { name: 'Skip' })).toBeEnabled()
    fireEvent.pointerOver(screen.getByRole('button', { name: 'GitHub' }))
    expect(pose()).toBe('normal')
    start(); expect(flood.createTechnologyFlood).toHaveBeenCalledOnce()
    act(() => { timeline().seek(flood.FLOOD_LABELS.sweptAway + .1, false) })
    expect(view.container.querySelector('section')).toHaveAttribute('data-tide-phase', 'sweptAway')
    act(() => { timeline().progress(1, false) })
    expect(screen.getByRole('status')).toHaveTextContent('Docker had it under control. More or less.')
    expect(screen.getByRole('button', { name: /Replay/ })).toBeEnabled()
    fireEvent.pointerOver(screen.getByRole('button', { name: 'GitHub' }))
    expect(pose()).toBe('cat')
  })
  it('keeps the focused reaction when a pointer leaves after scrolling or tapping', async () => {
    render(<Technologies />); await ready()
    const github = screen.getByRole('button', { name: 'GitHub' })
    act(() => github.focus())
    fireEvent.pointerOut(github)
    expect(pose()).toBe('cat')
    act(() => github.blur())
    expect(pose()).toBe('normal')
  })
  it('skips to the final state and returns focus without creating another timeline', async () => {
    const view = render(<Technologies />); await ready(); start()
    act(() => { timeline().seek(flood.FLOOD_LABELS.fill + .2, false) })
    const button = screen.getByRole('button', { name: 'Skip' })
    act(() => button.focus()); fireEvent.click(button)
    expect(timeline().progress()).toBe(1); expect(timeline().paused()).toBe(true)
    expect(view.container.querySelector('section')).toHaveAttribute('data-tide-phase', 'settled')
    expect(screen.getByRole('button', { name: /Replay/ })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Skip' })).not.toBeInTheDocument()
    expect(flood.createTechnologyFlood).toHaveBeenCalledOnce()
  })
  it.each(Object.entries(flood.FLOOD_LABELS))('restores every layer when skipping from %s', async (_label, at) => {
    const view = render(<Technologies />); await ready(); start()
    act(() => { timeline().seek(at + .12, false) })
    fireEvent.click(screen.getByRole('button', { name: 'Skip' }))
    const opacity = (selector: string) => Number(gsap.getProperty(view.container.querySelector(selector)!, 'opacity'))
    expect(opacity('.tide-water')).toBe(0)
    expect(opacity('.tide-whale')).toBe(0)
    expect(opacity('.tide-actor')).toBe(1)
    expect(opacity('.tide-idle-poses')).toBe(1)
    expect(opacity('.tide-pose-swept')).toBe(0)
    view.container.querySelectorAll('.tide-word').forEach(word => {
      for (const property of ['x', 'y', 'rotation']) expect(Number(gsap.getProperty(word, property))).toBe(0)
    })
    expect(timeline().getChildren().every(tween => tween.repeat() !== -1)).toBe(true)
  })
  it('repeats with fresh measurements and kills the previous timeline', async () => {
    const view = render(<Technologies />); await ready(); start()
    const first = timeline(), kill = vi.spyOn(first, 'kill')
    act(() => { first.progress(1, false) })
    fireEvent.click(screen.getByRole('button', { name: /Replay/ }))
    expect(flood.createTechnologyFlood).toHaveBeenCalledTimes(2)
    expect(kill).toHaveBeenCalledOnce()
    const second = timeline(), secondKill = vi.spyOn(second, 'kill')
    // Both useGSAP context reversion and our explicit cleanup may kill it.
    view.unmount(); expect(secondKill).toHaveBeenCalled()
  })
  it('returns all words to zero rather than leaving drift after draining', async () => {
    const view = render(<Technologies />); await ready(); start()
    const words = view.container.querySelectorAll('.tide-word')
    expect(words).toHaveLength(17)
    words.forEach(word => {
      const restore = timeline().getChildren().find(tween => 'targets' in tween && tween.targets().includes(word) && tween.vars.x === 0 && tween.vars.y === 0 && tween.vars.rotation === 0)
      expect(restore).toBeDefined()
    })
  })
  it('places the crest below category headings without a faucet or empty stage', () => {
    const section = document.createElement('section')
    section.innerHTML = '<div class="technology-grid"></div><div class="technology-tide"></div>'
    const lane = section.querySelector<HTMLElement>('.technology-tide')!, grid = section.querySelector<HTMLElement>('.technology-grid')!
    lane.getBoundingClientRect = () => ({ height: 240, bottom: 1040 } as DOMRect)
    grid.getBoundingClientRect = () => ({ top: 400 } as DOMRect)
    expect(flood.floodGeometry(section)).toEqual({ height: 592, surfaceShift: -352 })
  })
  it('finishes when scrolling away and removes listeners on unmount', async () => {
    const view = render(<Technologies />); await ready(); start()
    view.container.querySelector<HTMLElement>('section')!.getBoundingClientRect = () => ({ top: 2000, bottom: 3000 } as DOMRect)
    fireEvent.scroll(window)
    expect(timeline().progress()).toBe(1)
    expect(screen.getByRole('button', { name: /Replay/ })).toBeEnabled()
    view.unmount(); expect(media.removeEventListener).toHaveBeenCalled()
  })
  it('offers the static ending with reduced motion and keeps technology reactions working', async () => {
    media.matches = true
    render(<Technologies />); await ready(); start()
    expect(flood.createTechnologyFlood).not.toHaveBeenCalled()
    expect(screen.getByRole('status')).toHaveTextContent('Docker had it under control')
    expect(screen.getByRole('button', { name: /Replay/ })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'GitHub' }))
    expect(pose()).toBe('cat')
  })
  it('completes a running scene when the motion preference changes', async () => {
    render(<Technologies />); await ready(); start()
    media.matches = true
    act(() => media.addEventListener.mock.calls.at(-1)![1]())
    expect(timeline().progress()).toBe(1)
    expect(screen.getByText(/no animated flooding/)).toBeVisible()
  })
  it('keeps content and reactions available when a flood asset fails', async () => {
    assetWorks = false
    const view = render(<Technologies />); await ready()
    expect(screen.getByRole('button', { name: /Watch the wave/ })).toBeDisabled()
    expect(screen.getAllByRole('listitem')).toHaveLength(13)
    fireEvent.click(screen.getByRole('button', { name: 'React' }))
    expect(pose()).toBe('wink')
    expect(flood.createTechnologyFlood).not.toHaveBeenCalled()
    view.unmount(); expect(media.removeEventListener).toHaveBeenCalled()
  })
})
