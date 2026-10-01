import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'

export type GuideStop = 'inicio' | 'seeds' | 'hostiqr' | 'fintrack' | 'tecnologias' | 'sobre-mi' | 'final'
const GuideContext = createContext<{
  stop: GuideStop
  guided: boolean
  hidden: boolean
  selectedProject: string | null
  projectRequest: number
  panelOpen: boolean
  setPanelOpen: (value: boolean) => void
  setGuided: (value: boolean) => void
  setHidden: (value: boolean) => void
  showProject: (slug: string) => void
} | null>(null)

export function BittyGuideProvider({ children }: { children: ReactNode }) {
  const [stop, setStop] = useState<GuideStop>('inicio')
  const [guided, setGuided] = useState(() => localStorage.getItem('bitty-guide') === 'true')
  const [hidden, setHidden] = useState(() => localStorage.getItem('bitty-hidden') === 'true')
  const [selectedProject, setSelectedProject] = useState<string | null>(null)
  const [projectRequest, setProjectRequest] = useState(0)
  const [panelOpen, setPanelOpen] = useState(false)
  const preferredStop = useRef('inicio')

  useEffect(() => {
    localStorage.setItem('bitty-guide', String(guided))
    localStorage.setItem('bitty-hidden', String(hidden))
    document.documentElement.classList.toggle('bitty-hidden', hidden)
    return () => document.documentElement.classList.remove('bitty-hidden')
  }, [guided, hidden])

  useEffect(() => {
    const stops = ['inicio', 'proyectos', 'project-seeds', 'project-hostiqr', 'project-fintrack', 'tecnologias', 'sobre-mi', 'final']
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        if (document.documentElement.scrollHeight > window.innerHeight && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 24) {
          setStop('final')
          return
        }
        const line = window.innerHeight * 0.4
        let closest = stops[0]
        let distance = Infinity
        for (const id of stops) {
          const element = document.getElementById(id)
          if (!element) continue
          const rect = element.getBoundingClientRect()
          if (rect.bottom < 0 || rect.top > window.innerHeight) continue
          const nextDistance = rect.top <= line && rect.bottom >= line ? 0 : Math.abs(rect.top - line)
          if (nextDistance < distance || (nextDistance === distance && id === preferredStop.current)) { distance = nextDistance; closest = id }
        }
        setStop((closest === 'proyectos' ? 'seeds' : closest.replace('project-', '')) as GuideStop)
      })
    }
    const noticeProject = (event: Event) => {
      if (!(event.target instanceof Element)) return
      const article = event.target.closest<HTMLElement>('.project-card')
      if (!article) return
      preferredStop.current = article.id
      setStop(article.id.replace('project-', '') as GuideStop)
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    document.addEventListener('pointerover', noticeProject, { passive: true })
    document.addEventListener('focusin', noticeProject)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      document.removeEventListener('pointerover', noticeProject)
      document.removeEventListener('focusin', noticeProject)
    }
  }, [])

  function showProject(slug: string) {
    preferredStop.current = `project-${slug}`
    setStop(slug as GuideStop)
    setSelectedProject(slug)
    setProjectRequest((value) => value + 1)
    const target = document.getElementById(`project-${slug}`)
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
    // Focus a real control; the expanded case follows it in reading order.
    target?.querySelector<HTMLButtonElement>('.text-action')?.focus({ preventScroll: true })
  }

  return <GuideContext.Provider value={{ stop, guided, hidden, selectedProject, projectRequest, panelOpen, setPanelOpen, setGuided, setHidden, showProject }}>{children}</GuideContext.Provider>
}

export function useBittyGuide() { return useContext(GuideContext) }

export function BittyRest({ stop }: { stop: 'sobre-mi' | 'final' }) {
  const guide = useBittyGuide()
  const reduced = useReducedMotion()
  return <div className="bitty-rest"><AnimatePresence>
    {guide?.guided && !guide.hidden && guide.stop === stop && <motion.button
      type="button" aria-label="Explorar esta sección con Bitty" onClick={() => guide.setPanelOpen(true)}
      initial={{ opacity: 0, x: reduced ? 0 : 25, rotate: reduced ? 0 : 8 }}
      animate={{ opacity: 1, x: 0, rotate: 0 }} exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 200, damping: 18 }}>
      <img src="/assets/bitty-stand.png" alt="" /><span>¿Lo exploramos?</span>
    </motion.button>}
  </AnimatePresence></div>
}

export const guideCopy: Record<GuideStop, { title: string; text: string }> = {
  inicio: { title: 'Parece que buscas a un desarrollador…', text: 'Tengo uno justo aquí. React, Python y una mascota que no figura en la nómina. ¿Empezamos por su trabajo?' },
  seeds: { title: '¿Otra idea en una servilleta?', text: 'Traje una carpeta: se llama Seeds. Puedes probar la aplicación o revisar su caso. El aporte personal aún necesita documentación; mi imaginación no cuenta como evidencia.' },
  hostiqr: { title: 'Parece que estás mirando HostiQR…', text: 'Recepción digital para alojamientos con QR. Yo recibo a los visitantes de este portafolio. Sin sueldo, pero con animaciones. ¿Te abro la demo?' },
  fintrack: { title: 'Aquí todavía hay trabajo en proceso.', text: 'FinTrack no tiene una demo confirmada. Podría inventarte una historia espectacular, pero mi contrato prohíbe el humo. Te muestro lo que falta documentar.' },
  tecnologias: { title: 'Un stack, sin porcentajes mágicos.', text: 'Aquí se distingue la experiencia confirmada de las herramientas de este portafolio. La ballena es mi transporte, no una habilidad añadida al currículum.' },
  'sobre-mi': { title: '¿Quieres pruebas, además de piruetas?', text: 'Buena pregunta. Puedes ajustar mis ojos en vivo y mirar el código que los mueve. También te enseño una respuesta local que funciona sin IA.' },
  final: { title: 'Has llegado al final. Yo sobreviví.', text: '¿Revisamos el código o volvemos a los proyectos? Si solo viniste a verme caer, también lo entiendo.' },
}
