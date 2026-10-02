import { FormEvent, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useDragControls, useMotionValue, useReducedMotion } from 'motion/react'
import { askBitty } from '../api/bitty'
import type { BittyReply } from '../types'
import { guideCopy, useBittyGuide } from './BittyGuide'
import { getProject } from '../content/projects'
import { TIDE_ARRIVED_EVENT, TIDE_ARRIVED_KEY, TIDE_STARTED_EVENT } from './useTechnologyTide'

export function BittyChat() {
  const [localOpen, setLocalOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState<BittyReply | null>(null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const guide = useBittyGuide()
  const open = guide?.panelOpen ?? localOpen
  const setOpen = (value: boolean) => guide ? guide.setPanelOpen(value) : setLocalOpen(value)
  const reduced = useReducedMotion()
  const stop = guide?.stop ?? 'inicio'
  const copy = guideCopy[stop]
  const currentProject = getProject(stop)
  const [showSeed, setShowSeed] = useState(false)
  const [dismissedTips, setDismissedTips] = useState<string[]>([])
  const [reaction, setReaction] = useState<string | null>(null)
  const [tideArrived, setTideArrived] = useState(() => sessionStorage.getItem(TIDE_ARRIVED_KEY) === 'true')
  const boundsRef = useRef<HTMLDivElement>(null)
  const shellRef = useRef<HTMLElement>(null)
  const dragControls = useDragControls()
  const assistantX = useMotionValue(0)
  const assistantY = useMotionValue(0)
  const tipKey = guide?.guided ? stop : 'intro'
  const showTip = !dismissedTips.includes(tipKey)
  const skyCompact = ['seeds', 'hostiqr', 'fintrack'].includes(stop) && !open && !guide?.guided

  useEffect(() => {
    const arrive = () => {
      setTideArrived(true)
      setReaction('He aparcado la ballena. Ahora seguimos a pie.')
    }
    window.addEventListener(TIDE_ARRIVED_EVENT, arrive)
    const board = () => setTideArrived(false)
    window.addEventListener(TIDE_STARTED_EVENT, board)
    return () => {
      window.removeEventListener(TIDE_ARRIVED_EVENT, arrive)
      window.removeEventListener(TIDE_STARTED_EVENT, board)
    }
  }, [])

  useEffect(() => {
    // An expanded panel must fit even if the mascot was moved near an edge.
    assistantX.set(0)
    assistantY.set(0)
    const resetPosition = () => { assistantX.set(0); assistantY.set(0) }
    window.addEventListener('resize', resetPosition)
    return () => window.removeEventListener('resize', resetPosition)
  }, [open, assistantX, assistantY])

  useEffect(() => () => abortRef.current?.abort(), [])
  useEffect(() => {
    if (!open) return
    const escape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggleRef.current?.focus()
    }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [open])

  function navigate(id: string) {
    const target = document.getElementById(id)
    target?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    const heading = target?.querySelector<HTMLElement>('h2, h3')
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }) }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage || loading) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    setLoading(true)
    const result = await askBitty(cleanMessage, abortRef.current.signal)
    setReply(result)
    setLoading(false)
  }

  function runAction() {
    if (!reply) return
    if (reply.action.projectSlug && guide) {
      guide.showProject(reply.action.projectSlug)
      return
    }
    const target = reply.action.projectSlug
      ? document.getElementById(`project-${reply.action.projectSlug}`)
      : document.getElementById('proyectos')
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <><div ref={boundsRef} className="clippy-bounds" aria-hidden="true" />
    <motion.aside ref={shellRef} className={`bitty-chat clippy-assistant${(stop === 'inicio' || (stop === 'tecnologias' && !tideArrived)) && !open ? ' hero-companion-docked' : ''}${tideArrived && stop === 'tecnologias' && !open ? ' tide-companion-arrived' : ''}${open ? ' is-open' : ''}${skyCompact ? ' sky-guide-compact' : ''}${guide?.hidden ? ' guide-hidden' : ''}`} aria-label="Guía y preguntas de Bitty" drag dragListener={false} dragControls={dragControls} dragConstraints={boundsRef} dragElastic={0} dragMomentum={false} onDragStart={() => setReaction('¡Mis pies no tienen ruedas!')} onDragEnd={() => setReaction('Nueva oficina. Mismo sueldo: cero.')} style={{ x: assistantX, y: assistantY }}>
      {guide?.hidden ? <button className="restore-bitty" type="button" onClick={() => guide.setHidden(false)}>Mostrar a Bitty</button> : <>
      {showTip && !open && <motion.div key={tipKey} className="guide-teaser clippy-balloon" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}>
        <button className="dismiss-tip" type="button" aria-label="Descartar sugerencia de Bitty" onClick={() => setDismissedTips((tips) => [...tips, tipKey])}>×</button>
        <span>{guide?.guided ? copy.title : 'Parece que buscas a un desarrollador…'}</span>
        <p>{reaction ?? (guide?.guided ? '¿Te echo una mano? Esta vez sin caerme.' : '¿Quieres ver proyectos o descubrir el código detrás de mis piruetas?')}</p>
        <div><button type="button" onClick={() => setOpen(true)}>Ayúdame a explorar</button><button type="button" onClick={() => navigate('laboratorio-bitty')}>Muéstrame el código</button></div>
      </motion.div>}
      <AnimatePresence>
      {open && (
        <motion.div key="bitty-panel" className="chat-panel" id="bitty-panel" initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : 0.2 }}>
          <div className="chat-heading"><strong>Bitty.exe <small>asistente (casi) profesional</small></strong><button type="button" onClick={() => { setOpen(false); toggleRef.current?.focus() }} aria-label="Cerrar panel de Bitty">×</button></div>
          <div className="guide-settings">
            <button type="button" aria-pressed={guide?.guided ?? false} onClick={() => guide?.setGuided(!guide.guided)}>Modo guía {guide?.guided ? 'activo' : 'desactivado'}</button>
            <button type="button" onClick={() => { guide?.setHidden(true); setOpen(false) }}>Ocultar a Bitty</button>
          </div>
          <motion.div key={stop} className="guide-context" initial={{ opacity: 0, x: reduced ? 0 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <p className="guide-location">{copy.title}</p><p>{copy.text}</p>
            <div className="guide-actions">
              {currentProject ? <>
                <button type="button" onClick={() => guide?.showProject(currentProject.slug)}>Ver caso y decisiones →</button>
                {currentProject.url && <a href={currentProject.url} target="_blank" rel="noreferrer">Abrir demo ↗</a>}
                <button type="button" onClick={() => navigate(stop === 'seeds' ? 'project-hostiqr' : stop === 'hostiqr' ? 'project-fintrack' : 'sobre-mi')}>Siguiente parada →</button>
              </> : stop === 'sobre-mi' ? <>
                <button type="button" onClick={() => navigate('criterio-tecnico')}>Explícame las decisiones →</button>
                <a href="https://github.com/JoseMLuzu/personal-portfolio" target="_blank" rel="noreferrer">Código del portafolio ↗</a>
              </> : <>
                <button type="button" onClick={() => guide?.showProject('seeds')}>Muéstrame el trabajo →</button>
                <button type="button" onClick={() => navigate('sobre-mi')}>Conocer a José →</button>
              </>}
              <button type="button" onClick={() => setShowSeed((value) => !value)} aria-expanded={showSeed}>Quiero anotar una idea</button>
              <button type="button" onClick={() => { navigate('laboratorio-bitty'); setOpen(false) }}>Muéstrame cómo estás programado</button>
            </div>
          </motion.div>
          <AnimatePresence>{showSeed && <motion.div className="guide-seed-card" initial={{ opacity: 0, y: reduced ? 0 : 12, rotate: reduced ? 0 : -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0 }}>
            <small>De la carpeta de Bitty</small><strong>Seeds</strong><p>{getProject('seeds')?.summary}</p>
            <div className="guide-actions"><button type="button" onClick={() => guide?.showProject('seeds')}>Abrir ficha</button><a href={getProject('seeds')?.url ?? undefined} target="_blank" rel="noreferrer">Visitar aplicación ↗</a></div>
          </motion.div>}</AnimatePresence>
          {reply && (
            <div className="reply" aria-live="polite">
              <p>{reply.text}</p>
              {reply.action.type !== 'none' && <button type="button" onClick={runAction}>Ver en la página →</button>}
              <small>{reply.source === 'ai' ? 'Respuesta con IA' : 'Respuesta local'}</small>
            </div>
          )}
          <form onSubmit={submit}>
            <label htmlFor="bitty-message">Tu pregunta</label>
            <div>
              <input
                id="bitty-message"
                value={message}
                maxLength={600}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="¿Qué sabes de Seeds?"
                autoComplete="off"
              />
              <button type="submit" disabled={loading || !message.trim()} aria-label="Enviar pregunta">
                {loading ? '···' : '↗'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
      <div className="clippy-position-controls">
        <button type="button" className="clippy-grab" aria-label="Mover Bitty; usa las flechas del teclado" title="Arrastra con el mouse o usa las flechas del teclado" onPointerDown={(event) => { if (event.pointerType !== 'touch') dragControls.start(event) }} onKeyDown={(event) => {
          const shifts: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }
          const shift = shifts[event.key]
          const rect = shellRef.current?.getBoundingClientRect()
          if (!shift || !rect) return
          event.preventDefault()
          assistantX.set(assistantX.get() + Math.max(12 - rect.left, Math.min(window.innerWidth - 12 - rect.right, shift[0])))
          assistantY.set(assistantY.get() + Math.max(12 - rect.top, Math.min(window.innerHeight - 12 - rect.bottom, shift[1])))
        }}>⠿ Mover</button>
        <button type="button" onClick={() => { assistantX.set(0); assistantY.set(0) }} aria-label="Devolver Bitty a su sitio">↺</button>
      </div>
      <button ref={toggleRef} className="chat-toggle" type="button" aria-expanded={open} aria-controls="bitty-panel" aria-label={open ? 'Cerrar guía de Bitty' : 'Abrir guía y preguntas de Bitty'} onClick={() => setOpen(!open)}>
        <motion.span key={stop} className={`chat-bitty-sprite guide-pose-${stop}`} aria-hidden="true" initial={{ y: reduced ? 0 : -10, rotate: reduced ? 0 : -12 }} animate={{ y: 0, rotate: 0 }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 14 }} />
        <span>{open ? 'Cerrar' : 'Bitty · ¿te ayudo?'}</span>
      </button>
      </>}
    </motion.aside></>
  )
}
