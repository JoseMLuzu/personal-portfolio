import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import './ThemeCelestial.css'

export const THEME_STORAGE_KEY = 'portfolio-theme'
type Theme = 'light' | 'dark'
const readTheme = (): Theme => {
  try { return localStorage.getItem(THEME_STORAGE_KEY) === 'dark' ? 'dark' : 'light' }
  catch { return 'light' }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [cue, setCue] = useState<{ theme: Theme; id: number } | null>(null)
  useEffect(() => {
    if (!cue) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(() => setCue(null), reduced ? 2000 : 3500)
    return () => window.clearTimeout(timer)
  }, [cue])
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    try { localStorage.setItem(THEME_STORAGE_KEY, theme) } catch { /* Works even without storage. */ }
  }, [theme])
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY || event.key === null) setTheme(readTheme())
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const dark = theme === 'dark'
  const switchTheme = () => {
    const next = dark ? 'light' : 'dark'
    setTheme(next)
    setCue(previous => ({ theme: next, id: (previous?.id ?? 0) + 1 }))
  }
  return <><button className="theme-toggle" type="button" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
    aria-pressed={dark} title={dark ? 'Switch to light' : 'Switch to dark'} onClick={switchTheme}>
    {dark ? <Sun aria-hidden="true" size={19} /> : <Moon aria-hidden="true" size={19} />}
    <span className="theme-bitty-stage" aria-hidden="true">
      <img className="theme-bitty-pose" data-visible={!dark} src="/assets/bitty-theme-sleepy.png" alt="" width="1024" height="1536" draggable={false} />
      <img className="theme-bitty-pose" data-visible={dark} src="/assets/bitty-theme-sunglasses.png" alt="" width="1024" height="1536" draggable={false} />
    </span>
  </button>
  {cue && <div key={cue.id} className={`theme-celestial theme-celestial-${cue.theme}`} aria-hidden="true"
    onAnimationEnd={event => { if (event.target === event.currentTarget) setCue(null) }}>
    <img src={cue.theme === 'dark' ? '/assets/theme-pixel-moon.png' : '/assets/theme-pixel-sun.png'} alt="" draggable={false} />
  </div>}
  </>
}
