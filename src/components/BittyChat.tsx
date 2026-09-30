import { FormEvent, useRef, useState } from 'react'
import { askBitty } from '../api/bitty'
import type { BittyReply } from '../types'

export function BittyChat() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [reply, setReply] = useState<BittyReply | null>(null)
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

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
    const target = reply.action.projectSlug
      ? document.getElementById(`project-${reply.action.projectSlug}`)
      : document.getElementById('proyectos')
    target?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })
  }

  return (
    <aside className={`bitty-chat${open ? ' is-open' : ''}`} aria-label="Pregúntale a Bitty">
      {open && (
        <div className="chat-panel">
          <div className="chat-heading"><strong>Bitty</strong><span>Pregúntame por José o sus proyectos.</span></div>
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
        </div>
      )}
      <button className="chat-toggle" type="button" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span className="chat-bitty-sprite" aria-hidden="true" />
        <span>{open ? 'Cerrar' : 'Habla con Bitty'}</span>
      </button>
    </aside>
  )
}
