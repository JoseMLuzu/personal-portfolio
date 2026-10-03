import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

beforeEach(() => {
  localStorage.clear()
  sessionStorage.setItem('bitty-intro-seen-v1', 'true')
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

describe('portfolio navigation', () => {
  it('exposes every project without requiring Bitty', () => {
    const { container } = render(<App />)
    expect(screen.getByRole('navigation', { name: /main navigation/i })).toBeVisible()
    expect(container.querySelector('.projects-sky')).toBeInTheDocument()
    expect(container.querySelector('.sky-diver')).toHaveAttribute('aria-hidden', 'true')
    expect(container.querySelector('[data-cloud-word="AWS"]')).toHaveAttribute('aria-hidden', 'true')
    for (const name of ['AWS', 'Azure', 'Google Cloud']) {
      const cloud = container.querySelector(`[data-cloud-word="${name}"]`)
      expect(cloud?.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
      expect(cloud?.querySelectorAll('circle').length).toBeGreaterThan(30)
      expect(cloud?.querySelector('img')).toBeNull()
      expect(container.querySelector('#tecnologias')).not.toHaveTextContent(name)
    }
    expect(container.querySelector('#tecnologias')).not.toHaveTextContent('AWS')
    expect(screen.getByRole('heading', { name: 'Seeds' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'HostiQR' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'FinTrack' })).toBeVisible()
    expect(screen.getByRole('region', { name: /tools i build with/i })).toBeVisible()
    expect(screen.getByRole('link', { name: /see my work/i })).toHaveAttribute('href', '#proyectos')
    expect(container.querySelectorAll('.project-bitty')).toHaveLength(3)
    container.querySelectorAll('.project-bitty').forEach((bitty) => expect(bitty).toHaveAttribute('aria-hidden', 'true'))
  })

  it('supports keyboard access to project details', async () => {
    const user = userEvent.setup()
    render(<App />)
    const detailsButton = screen.getAllByRole('button', { name: /open case study/i })[0]

    detailsButton.focus()
    await user.keyboard('{Enter}')

    expect(detailsButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Details to review')).toBeVisible()
  })

  it('opens the case deterministically from Bitty and can reopen a closed case', async () => {
    const user = userEvent.setup()
    const network = vi.spyOn(globalThis, 'fetch')
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /open bitty’s guide and questions/i }))
    await user.click(screen.getByRole('button', { name: /view case study and decisions/i }))
    expect(screen.getByRole('button', { name: /close case study/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('To document: personal responsibilities and scope of work.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /close case study/i }))
    await user.click(screen.getByRole('button', { name: /view case study and decisions/i }))
    expect(screen.getByRole('button', { name: /close case study/i })).toHaveAttribute('aria-expanded', 'true')
    expect(network).not.toHaveBeenCalled()
    network.mockRestore()
  })

  it('remembers guide preferences and restores a hidden Bitty', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /open bitty’s guide and questions/i }))
    await user.click(screen.getByRole('button', { name: /guide mode off/i }))
    expect(localStorage.getItem('bitty-guide')).toBe('true')
    await user.click(screen.getByRole('button', { name: /hide bitty/i }))
    expect(localStorage.getItem('bitty-hidden')).toBe('true')
    expect(document.documentElement).toHaveClass('bitty-hidden')
    await user.click(screen.getByRole('button', { name: /show bitty/i }))
    expect(document.documentElement).not.toHaveClass('bitty-hidden')
    expect(localStorage.getItem('bitty-hidden')).toBe('false')
  })

  it('closes the guide with Escape and returns keyboard focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /open bitty’s guide and questions/i }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /open bitty’s guide and questions/i })).toHaveFocus()
  })

  it('demonstrates code with editable spring settings and local project actions', async () => {
    const user = userEvent.setup()
    const network = vi.spyOn(globalThis, 'fetch')
    render(<App />)
    const lab = within(screen.getByRole('region', { name: /personality is programmed, too/i }))
    fireEvent.change(lab.getByRole('slider', { name: /stiffness/i }), { target: { value: '100' } })
    expect(lab.getByLabelText('Example configuration')).toHaveTextContent('stiffness: 100')
    await user.click(lab.getByRole('button', { name: 'FinTrack' }))
    expect(lab.getByLabelText('Local response contract')).toHaveTextContent('"projectSlug": "fintrack"')
    expect(lab.getByText('Demo not confirmed')).toBeVisible()
    await user.click(lab.getByRole('button', { name: 'Reset' }))
    expect(lab.getByLabelText('Example configuration')).toHaveTextContent('stiffness: 320')
    expect(network).not.toHaveBeenCalled()
    network.mockRestore()
  })
})
