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
    expect(screen.getByRole('navigation', { name: /navegación principal/i })).toBeVisible()
    expect(container.querySelector('.projects-sky')).toBeInTheDocument()
    expect(container.querySelector('.sky-diver')).toHaveAttribute('aria-hidden', 'true')
    expect(screen.getByRole('heading', { name: 'Seeds' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'HostiQR' })).toBeVisible()
    expect(screen.getByRole('heading', { name: 'FinTrack' })).toBeVisible()
    expect(screen.getByRole('region', { name: /con qué construyo/i })).toBeVisible()
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

  it('opens the case deterministically from Bitty and can reopen a closed case', async () => {
    const user = userEvent.setup()
    const network = vi.spyOn(globalThis, 'fetch')
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /abrir guía y preguntas/i }))
    await user.click(screen.getByRole('button', { name: /ver caso y decisiones/i }))
    expect(screen.getByRole('button', { name: /cerrar ficha/i })).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Por documentar: responsabilidad personal y alcance del trabajo.')).toBeVisible()
    await user.click(screen.getByRole('button', { name: /cerrar ficha/i }))
    await user.click(screen.getByRole('button', { name: /ver caso y decisiones/i }))
    expect(screen.getByRole('button', { name: /cerrar ficha/i })).toHaveAttribute('aria-expanded', 'true')
    expect(network).not.toHaveBeenCalled()
    network.mockRestore()
  })

  it('remembers guide preferences and restores a hidden Bitty', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /abrir guía y preguntas/i }))
    await user.click(screen.getByRole('button', { name: /modo guía desactivado/i }))
    expect(localStorage.getItem('bitty-guide')).toBe('true')
    await user.click(screen.getByRole('button', { name: /ocultar a bitty/i }))
    expect(localStorage.getItem('bitty-hidden')).toBe('true')
    expect(document.documentElement).toHaveClass('bitty-hidden')
    await user.click(screen.getByRole('button', { name: /mostrar a bitty/i }))
    expect(document.documentElement).not.toHaveClass('bitty-hidden')
    expect(localStorage.getItem('bitty-hidden')).toBe('false')
  })

  it('closes the guide with Escape and returns keyboard focus', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.pointerOver(screen.getByRole('heading', { name: 'Seeds' }))
    await user.click(screen.getByRole('button', { name: /abrir guía y preguntas/i }))
    await user.keyboard('{Escape}')
    expect(screen.getByRole('button', { name: /abrir guía y preguntas/i })).toHaveFocus()
  })

  it('demonstrates code with editable spring settings and local project actions', async () => {
    const user = userEvent.setup()
    const network = vi.spyOn(globalThis, 'fetch')
    render(<App />)
    const lab = within(screen.getByRole('region', { name: /la personalidad también se programa/i }))
    fireEvent.change(lab.getByRole('slider', { name: /rigidez/i }), { target: { value: '100' } })
    expect(lab.getByLabelText('Configuración del ejemplo')).toHaveTextContent('stiffness: 100')
    await user.click(lab.getByRole('button', { name: 'FinTrack' }))
    expect(lab.getByLabelText('Contrato de la respuesta local')).toHaveTextContent('"projectSlug": "fintrack"')
    expect(lab.getByText('Demo no confirmada')).toBeVisible()
    await user.click(lab.getByRole('button', { name: 'Restablecer' }))
    expect(lab.getByLabelText('Configuración del ejemplo')).toHaveTextContent('stiffness: 320')
    expect(network).not.toHaveBeenCalled()
    network.mockRestore()
  })
})
