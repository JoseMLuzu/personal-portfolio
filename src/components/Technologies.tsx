import { technologyGroups } from '../content/technologies'
import './Technologies.css'
import { useTechnologyTide } from './useTechnologyTide'

export function Technologies() {
  const { sectionRef, sceneRef, phase } = useTechnologyTide()
  return <section ref={sectionRef} className={`technologies tide-${phase}`} data-tide-phase={phase} id="tecnologias" aria-labelledby="technologies-title">
    <div className="technologies-inner">
      <header className="technologies-header">
        <div>
          <p className="eyebrow">// Mi stack</p>
          <h2 id="technologies-title">Con qué <span className="technology-title-mark">construyo</span>.</h2>
        </div>
        <p><span className="technology-legend-dot" aria-hidden="true" /> Experiencia en React, Python y bases de datos. El resto forma parte de este portafolio.</p>
      </header>
      <div className="technology-grid">
        {technologyGroups.map(group => {
          return <article className="technology-group" key={group.id} aria-labelledby={`technology-${group.id}`}>
            <header>
              <h3 id={`technology-${group.id}`}>{group.title}</h3>
            </header>
            <ul>
              {group.items.map(item => <li key={item.name}>
                <div className="technology-row"><span className="technology-name" data-experience={item.context === 'experience' ? 'true' : undefined}><span className="technology-buoy">{item.name}</span></span>
                  <span className={`technology-context context-${item.context}`}>{item.context === 'experience' ? 'Experiencia' : 'Este portafolio'}</span>
                </div>
                {item.note && <p className="technology-note">{item.note}</p>}
              </li>)}
            </ul>
          </article>
        })}
      </div>
    </div>
    <div ref={sceneRef} className="technology-tide" aria-hidden="true">
      <div className="tide-water" />
      <div className="tide-whale">
        <span className="tide-wake" />
        <div className="tide-rider">
          <img className="tide-whale-wave" src="/assets/bitty-whale-wave.png" alt="" width="1536" height="1024" />
          <img className="tide-whale-ride" src="/assets/bitty-whale-ride.png" alt="" width="1536" height="1024" />
        </div>
      </div>
    </div>
  </section>
}
