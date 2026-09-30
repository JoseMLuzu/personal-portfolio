import { useEffect, useRef, useState } from 'react'
import { getProject } from '../content/projects'
import { BITTY_SESSION_KEY, shouldAutoplayIntro } from './bittySession'

type Phase = 'ready' | 'tipping' | 'falling' | 'noticing' | 'approaching' | 'lifting' | 'restoring' | 'done'

export function BittyScene({ onPhaseChange }: { onPhaseChange?: (phase: Phase) => void }) {
  const [phase, setPhase] = useState<Phase>('ready')
  const [showSeed, setShowSeed] = useState(false)
  const timeouts = useRef<number[]>([])
  const seeds = getProject('seeds')!

  function changePhase(next: Phase) {
    setPhase(next)
    if (next === 'done') sessionStorage.setItem(BITTY_SESSION_KEY, 'true')
    onPhaseChange?.(next)
  }

  function play() {
    timeouts.current.forEach(window.clearTimeout)
    timeouts.current = []
    setShowSeed(false)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      changePhase('done')
      return
    }
    changePhase('ready')
    ;([
      [400, 'tipping'],
      [780, 'falling'],
      [1500, 'noticing'],
      [2250, 'approaching'],
      [3200, 'lifting'],
      [4050, 'restoring'],
      [5000, 'done'],
    ] as [number, Phase][]).forEach(([delay, next]) => {
      timeouts.current.push(window.setTimeout(() => changePhase(next), delay))
    })
  }

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (shouldAutoplayIntro(sessionStorage, reduced)) {
      play()
    } else {
      changePhase('done')
    }
    return () => timeouts.current.forEach(window.clearTimeout)
    // The scene is intentionally evaluated once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const dialogue = phase === 'noticing'
    ? 'Eso no debería pasar…'
    : phase === 'approaching'
      ? 'Quietita. Ya voy.'
      : phase === 'lifting'
        ? 'Arriba… con cuidado.'
      : phase === 'restoring'
        ? 'Casi. Casi.'
        : phase === 'done'
          ? 'Como si nada.'
          : 'Bitty al rescate.'

  return (
    <div className={`bitty-scene phase-${phase}${showSeed ? ' is-presenting' : ''}`} aria-label="Escena interactiva de Bitty">
      <button className="replay" type="button" onClick={play} aria-label="Repetir la escena de Bitty">↻ Repetir escena</button>
      <div className="speech" role="status">{dialogue}</div>
      <span
        className="bitty bitty-sprite"
        role="img"
        aria-label="Bitty, una pequeña mascota azul con forma de cursor"
      />
      <button className="idea-action" type="button" onClick={() => setShowSeed(true)}>
        Quiero anotar una idea <span aria-hidden="true">→</span>
      </button>
      {showSeed && (
        <div className="folder">
          <div className="seed-card">
            <span className="seed-kicker">Bitty encontró esto</span>
            <strong>Seeds</strong>
            <p>{seeds.summary}</p>
            <div>
              <a href="#project-seeds">Abrir ficha</a>
              <a href={seeds.url!} target="_blank" rel="noreferrer">Visitar app ↗</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
