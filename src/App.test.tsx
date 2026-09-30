import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { App } from './App'

beforeEach(() => {
  sessionStorage.setItem('bitty-intro-seen-v1', 'true')
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(() => ({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  })
})

describe('portfolio navigation', () => {
  it('exposes every project without requiring Bitty', () => {
    const { container } = render(<App />)
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Seeds' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'HostiQR' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'FinTrack' })).toBeVisible()
    expect(screen.getByRole('link', { name: /ver proyectos/i })).toHaveAttribute('href', '#proyectos')
    expect(container.querySelectorAll('.project-bitty')).toHaveLength(3)
    container.querySelectorAll('.project-bitty').forEach((bitty) => expect(bitty).toHaveAttribute('aria-hidden', 'true'))
  })

  it('supports keyboard access to project details', async () => {
    const user = userEvent.setup()
    render(<App />)
    const detailsButton = screen.getAllByRole('button', { name: /abrir ficha/i })[0]

    detailsButton.focus()
    await user.keyboard('{Enter}')

    expect(detailsButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Datos por revisar')).toBeVisible()
  })
})
