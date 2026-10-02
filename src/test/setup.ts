import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Browser APIs required by ScrollTrigger during plugin registration in jsdom.
if (!window.matchMedia) window.matchMedia = (media: string) => ({ matches: false, media, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {}, dispatchEvent: () => false })

afterEach(() => cleanup())
