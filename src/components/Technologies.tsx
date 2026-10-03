import { useState } from 'react'
import { bittyTechnologySprites, technologyGroups, type BittyTechnologyPose } from '../content/technologies'
import './Technologies.css'
import { useTechnologyTide } from './useTechnologyTide'

type Reaction = { name: string; usage: string; pose: BittyTechnologyPose }
export function Technologies() {
  const tide = useTechnologyTide()
  const { sectionRef, phase, playing, hasPlayed, ready, assetError, reducedMotion } = tide
  const [activeTechnology, setActiveTechnology] = useState<Reaction | null>(null)
  const [reactionTop, setReactionTop] = useState<number | null>(null)
  const reactTo = (item: Reaction | null, element?: HTMLElement) => {
    if (playing) return
    setActiveTechnology(item)
    setReactionTop(item && element ? element.getBoundingClientRect().top - sectionRef.current!.getBoundingClientRect().top - 24 : null)
  }
  const start = () => { setActiveTechnology(null); setReactionTop(null); tide.start() }
  const pose = playing ? 'normal' : activeTechnology?.pose ?? 'normal'
  const message = playing ? 'It was a small wave. You can skip the scene.' : activeTechnology?.usage ??
    (hasPlayed ? 'Docker had it under control. More or less.' : 'I was only going to dip my toes in.')

  return <section ref={sectionRef} className={`technologies technologies-beach tide-${phase}${playing ? ' tide-playing' : ''}${reactionTop !== null ? ' technology-reacting' : ''}`} data-tide-phase={phase} data-active-technology={activeTechnology?.name ?? ''} id="tecnologias" aria-labelledby="technologies-title">
    <div className="technologies-inner">
      <header className="technologies-header">
        <div>
          <p className="eyebrow">// My stack</p>
          <h2 id="technologies-title">Tools I <span className="technology-title-mark">build with.</span></h2>
        </div>
        <div className="technology-header-footer">
          <div className="technology-controls">
            <button className="technology-replay technology-start" type="button" onClick={start} disabled={!ready} aria-disabled={playing}>{hasPlayed ? '↻ Replay' : '≈ Watch the wave'}</button>
            {playing && <button className="technology-replay technology-skip" type="button" onClick={tide.skip}>Skip</button>}
          </div>
          {reducedMotion && <span className="technology-motion-note">Reduced motion: no animated flooding.</span>}
          {assetError && <span className="technology-motion-note">The scene is unavailable. You can still explore every technology.</span>}
        </div>
        <p className="technology-context" role="status" aria-live="polite">{message}</p>
      </header>
      <div className="technology-grid">
        {technologyGroups.map((group, index) => <article className="technology-group" key={group.id} aria-labelledby={`technology-${group.id}`}>
          <header>
            <span className="technology-number" aria-hidden="true">0{index + 1}</span>
            <h3 className="tide-word" id={`technology-${group.id}`}>{group.title}</h3>
          </header>
          <ul>
            {group.items.map((item, itemIndex) => {
              const selected = !playing && activeTechnology?.name === item.name
              const descriptionId = `technology-usage-${group.id}-${itemIndex}`
              return <li key={item.name} className={selected ? 'technology-selected' : ''}>
                <div className="technology-row">
                  <button className="technology-name tide-word" type="button" data-experience={item.context === 'experience' ? 'true' : undefined} aria-describedby={descriptionId}
                    onPointerEnter={event => reactTo(item, event.currentTarget)} onPointerLeave={event => { if (event.pointerType !== 'touch' && document.activeElement !== event.currentTarget) reactTo(null) }} onFocus={event => reactTo(item, event.currentTarget)} onBlur={() => reactTo(null)} onClick={event => reactTo(item, event.currentTarget)} onKeyDown={event => { if (event.key === 'Escape') reactTo(null) }}>
                    {item.name}
                  </button>
                  <span className="technology-context">{item.context === 'experience' ? 'Experience' : 'This portfolio'}</span>
                  {item.href && <a className="technology-source-link" href={item.href} target="_blank" rel="noopener noreferrer" aria-label={`View ${item.name} repository (new tab)`}>View repo ↗</a>}
                </div>
                <span className="technology-context" id={descriptionId}>{item.usage}</span>
              </li>
            })}
          </ul>
        </article>)}
      </div>
    </div>
    <div className="technology-reaction-sprite" style={{ top: reactionTop ?? 0 }} aria-hidden="true" data-visible={reactionTop !== null && !playing}>
      {Object.entries(bittyTechnologySprites).map(([key, src]) => <img className="tide-idle-pose" data-visible={pose === key} src={src} alt="" key={key} />)}
    </div>
    <div className="technology-tide">
      <div className="tide-water" aria-hidden="true">
        <div className="tide-wave tide-wave-back" />
        <div className="tide-wave tide-wave-front" />
      </div>
      <div className="tide-actor" aria-hidden="true">
        <div className="tide-idle-poses" data-pose={pose}>
          {Object.entries(bittyTechnologySprites).map(([key, src]) => <img className="tide-idle-pose" data-visible={pose === key} src={src} alt="" key={key} />)}
        </div>
        <img className="tide-pose-oops" src="/assets/bitty-tap-oops.png" alt="" width="1024" height="1536" />
        <img className="tide-pose-swept" src="/assets/bitty-swept-left.png" alt="" width="1536" height="1024" />
      </div>
      <span className="tide-caption tide-caption-control" aria-hidden="true">I’ve got thi—</span>
      <span className="tide-caption tide-caption-transport" aria-hidden="true">Found a ride.</span>
      <div className="tide-whale" aria-hidden="true">
        <span className="tide-wake" />
        <span className="tide-splash" /><span className="tide-splash" /><span className="tide-splash" />
        <div className="tide-rider"><img src="/assets/bitty-whale-wave.png" alt="" width="1536" height="1024" /></div>
      </div>
    </div>
  </section>
}
