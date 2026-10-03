import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Navbar } from './navbar'

describe('navbar Bitty poses', () => {
  afterEach(() => vi.unstubAllEnvs())

  it('adds the admiring pose to the configured GitHub link without changing its accessible name', () => {
    vi.stubEnv('VITE_GITHUB_URL', 'https://github.com/JoseMLuzu')
    render(<Navbar />)
    const github = screen.getByRole('link', { name: 'José Manuel’s GitHub (opens in a new tab)' })
    expect(github).toHaveAttribute('href', 'https://github.com/JoseMLuzu')
    expect(github).toHaveAttribute('rel', 'noopener noreferrer')
    expect(github).toHaveClass('nav-bitty-github')
    expect(github.querySelector('img')).toHaveAttribute('src', '/assets/bitty-nav-github-awe.png')
    expect(github.querySelector('img')).toHaveAttribute('alt', '')
    expect(github.querySelector('.nav-bitty-stage')).toHaveAttribute('aria-hidden', 'true')
  })

  it('preserves accessible links with the requested decorative poses', () => {
    render(<Navbar />)
    const projects = screen.getByRole('link', { name: 'Projects' })
    const about = screen.getByRole('link', { name: 'About me' })
    expect(projects).toHaveAttribute('href', '#proyectos')
    expect(about).toHaveAttribute('href', '#sobre-mi')
    expect(projects.querySelector('img')).toHaveAttribute('src', '/assets/bitty-nav-climb.png')
    expect(about.querySelector('img')).toHaveAttribute('src', '/assets/bitty-nav-wink.png')
    for (const link of [projects, about]) {
      expect(link.querySelector('img')).toHaveAttribute('alt', '')
      expect(link.querySelector('img')).toHaveAttribute('aria-hidden', 'true')
    }
  })
})
