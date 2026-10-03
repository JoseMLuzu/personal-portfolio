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
      setReaction('I parked the whale. We’re walking from here.')
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
    <motion.aside ref={shellRef} className={`bitty-chat clippy-assistant${(stop === 'inicio' || (stop === 'tecnologias' && !tideArrived)) && !open ? ' hero-companion-docked' : ''}${tideArrived && stop === 'tecnologias' && !open ? ' tide-companion-arrived' : ''}${open ? ' is-open' : ''}${skyCompact ? ' sky-guide-compact' : ''}${guide?.hidden ? ' guide-hidden' : ''}`} aria-label="Bitty’s guide and questions" drag dragListener={false} dragControls={dragControls} dragConstraints={boundsRef} dragElastic={0} dragMomentum={false} onDragStart={() => setReaction('My feet don’t have wheels!')} onDragEnd={() => setReaction('New office. Same salary: zero.')} style={{ x: assistantX, y: assistantY }}>
      {guide?.hidden ? <button className="restore-bitty" type="button" onClick={() => guide.setHidden(false)}>Show Bitty</button> : <>
      {showTip && !open && <motion.div key={tipKey} className="guide-teaser clippy-balloon" initial={{ opacity: 0, y: reduced ? 0 : 8 }} animate={{ opacity: 1, y: 0 }}>
        <button className="dismiss-tip" type="button" aria-label="Dismiss Bitty’s suggestion" onClick={() => setDismissedTips((tips) => [...tips, tipKey])}>×</button>
        <span>{guide?.guided ? copy.title : 'Looks like you’re looking for a developer…'}</span>
        <p>{reaction ?? (guide?.guided ? 'Need a hand? No falling this time.' : 'Want to see the projects or explore the code behind my acrobatics?')}</p>
        <div><button type="button" onClick={() => setOpen(true)}>Help me explore</button><button type="button" onClick={() => navigate('laboratorio-bitty')}>Show me the code</button></div>
      </motion.div>}
      <AnimatePresence>
      {open && (
        <motion.div key="bitty-panel" className="chat-panel" id="bitty-panel" initial={{ opacity: 0, y: reduced ? 0 : 16, scale: reduced ? 1 : 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: reduced ? 0 : 8 }} transition={{ duration: reduced ? 0 : 0.2 }}>
          <div className="chat-heading"><strong>Bitty.exe <small>(almost) professional assistant</small></strong><button type="button" onClick={() => { setOpen(false); toggleRef.current?.focus() }} aria-label="Close Bitty’s panel">×</button></div>
          <div className="guide-settings">
            <button type="button" aria-pressed={guide?.guided ?? false} onClick={() => guide?.setGuided(!guide.guided)}>Guide mode {guide?.guided ? 'on' : 'off'}</button>
            <button type="button" onClick={() => { guide?.setHidden(true); setOpen(false) }}>Hide Bitty</button>
          </div>
          <motion.div key={stop} className="guide-context" initial={{ opacity: 0, x: reduced ? 0 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: reduced ? 0 : 0.2 }}>
            <p className="guide-location">{copy.title}</p><p>{copy.text}</p>
            <div className="guide-actions">
              {currentProject ? <>
                <button type="button" onClick={() => guide?.showProject(currentProject.slug)}>View case study and decisions →</button>
                {currentProject.url && <a href={currentProject.url} target="_blank" rel="noreferrer">Open demo ↗</a>}
                <button type="button" onClick={() => navigate(stop === 'seeds' ? 'project-hostiqr' : stop === 'hostiqr' ? 'project-fintrack' : 'sobre-mi')}>Next stop →</button>
              </> : stop === 'sobre-mi' ? <>
                <button type="button" onClick={() => navigate('criterio-tecnico')}>Explain the decisions →</button>
                <a href="https://github.com/JoseMLuzu/personal-portfolio" target="_blank" rel="noreferrer">Portfolio source ↗</a>
              </> : <>
                <button type="button" onClick={() => guide?.showProject('seeds')}>Show me the work →</button>
                <button type="button" onClick={() => navigate('sobre-mi')}>Meet José →</button>
              </>}
              <button type="button" onClick={() => setShowSeed((value) => !value)} aria-expanded={showSeed}>I want to save an idea</button>
              <button type="button" onClick={() => { navigate('laboratorio-bitty'); setOpen(false) }}>Show me how you’re programmed</button>
            </div>
          </motion.div>
          <AnimatePresence>{showSeed && <motion.div className="guide-seed-card" initial={{ opacity: 0, y: reduced ? 0 : 12, rotate: reduced ? 0 : -3 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={{ opacity: 0 }}>
            <small>From Bitty’s folder</small><strong>Seeds</strong><p>{getProject('seeds')?.summary}</p>
            <div className="guide-actions"><button type="button" onClick={() => guide?.showProject('seeds')}>Open case study</button><a href={getProject('seeds')?.url ?? undefined} target="_blank" rel="noreferrer">Visit app ↗</a></div>
          </motion.div>}</AnimatePresence>
          {reply && (
            <div className="reply" aria-live="polite">
              <p>{reply.text}</p>
              {reply.action.type !== 'none' && <button type="button" onClick={runAction}>See on the page →</button>}
              <small>{reply.source === 'ai' ? 'AI reply' : 'Local reply'}</small>
            </div>
          )}
          <form onSubmit={submit}>
            <label htmlFor="bitty-message">Your question</label>
            <div>
              <input
                id="bitty-message"
                value={message}
                maxLength={600}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="What do you know about Seeds?"
                autoComplete="off"
              />
              <button type="submit" disabled={loading || !message.trim()} aria-label="Send question">
                {loading ? '···' : '↗'}
              </button>
            </div>
          </form>
        </motion.div>
      )}
      </AnimatePresence>
      <div className="clippy-position-controls">
        <button type="button" className="clippy-grab" aria-label="Move Bitty; use the arrow keys" title="Drag with the mouse or use the arrow keys" onPointerDown={(event) => { if (event.pointerType !== 'touch') dragControls.start(event) }} onKeyDown={(event) => {
          const shifts: Record<string, [number, number]> = { ArrowLeft: [-24, 0], ArrowRight: [24, 0], ArrowUp: [0, -24], ArrowDown: [0, 24] }
          const shift = shifts[event.key]
          const rect = shellRef.current?.getBoundingClientRect()
          if (!shift || !rect) return
          event.preventDefault()
          assistantX.set(assistantX.get() + Math.max(12 - rect.left, Math.min(window.innerWidth - 12 - rect.right, shift[0])))
          assistantY.set(assistantY.get() + Math.max(12 - rect.top, Math.min(window.innerHeight - 12 - rect.bottom, shift[1])))
        }}>⠿ Move</button>
        <button type="button" onClick={() => { assistantX.set(0); assistantY.set(0) }} aria-label="Reset Bitty’s position">↺</button>
      </div>
      <button ref={toggleRef} className="chat-toggle" type="button" aria-expanded={open} aria-controls="bitty-panel" aria-label={open ? 'Close Bitty’s guide' : 'Open Bitty’s guide and questions'} onClick={() => setOpen(!open)}>
        <motion.span key={stop} className={`chat-bitty-sprite guide-pose-${stop}`} aria-hidden="true" initial={{ y: reduced ? 0 : -10, rotate: reduced ? 0 : -12 }} animate={{ y: 0, rotate: 0 }} transition={reduced ? { duration: 0 } : { type: 'spring', stiffness: 220, damping: 14 }} />
        <span>{open ? 'Close' : 'Bitty · need a hand?'}</span>
      </button>
      </>}
    </motion.aside></>
  )
}
